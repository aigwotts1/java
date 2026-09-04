package com.quickdevbase.assessment;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.quickdevbase.assessment.AssessmentQuestionFactory.QuestionDraft;
import com.quickdevbase.course.CourseCatalog.Course;
import com.quickdevbase.learning.LearningService;
import com.quickdevbase.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class AssessmentService {
    public static final int QUESTION_COUNT = 15;
    public static final int PASSING_SCORE = 11;
    public static final int MAX_ATTEMPTS = 3;
    public static final int MAX_WARNINGS = 2;
    public static final Duration TIME_LIMIT = Duration.ofMinutes(10);

    private final JdbcTemplate jdbc;
    private final LearningService learning;
    private final AssessmentQuestionFactory questionFactory;
    private final ObjectMapper mapper;

    public AssessmentService(
        JdbcTemplate jdbc,
        LearningService learning,
        com.quickdevbase.ai.KnowledgeCatalog catalog,
        ObjectMapper mapper
    ) {
        this.jdbc = jdbc;
        this.learning = learning;
        this.questionFactory = new AssessmentQuestionFactory(catalog);
        this.mapper = mapper;
    }

    @Transactional
    public AssessmentStatus status(UUID userId, Course course) {
        finishExpiredAttempt(userId, course);
        int completed = learning.completedCount(userId, course);
        int used = attemptCount(userId, course);
        boolean passed = hasPassed(userId, course);
        AttemptView active = activeAttempt(userId, course).map(this::attemptView).orElse(null);
        return new AssessmentStatus(
            course.key(), course.shortTitle(), course.path(),
            completed >= course.moduleCount(), completed, course.moduleCount(),
            passed, used, Math.max(0, MAX_ATTEMPTS - used), active
        );
    }

    public boolean hasPassed(UUID userId, Course course) {
        Boolean passed = jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM assessment_attempts WHERE user_id = ? AND course_code = ? AND status = 'PASSED')",
            Boolean.class, userId, course.code()
        );
        return Boolean.TRUE.equals(passed);
    }

    @Transactional
    public AttemptView start(UUID userId, Course course) {
        jdbc.queryForObject("SELECT id FROM users WHERE id = ? FOR UPDATE", UUID.class, userId);
        finishExpiredAttempt(userId, course);
        if (learning.completedCount(userId, course) < course.moduleCount()) {
            throw new ApiException(HttpStatus.CONFLICT, "Complete every module before starting the certificate assessment.");
        }
        if (hasPassed(userId, course)) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already passed this assessment.");
        }
        Optional<AttemptRecord> active = activeAttempt(userId, course);
        if (active.isPresent()) return attemptView(active.get());

        int attemptNumber = attemptCount(userId, course) + 1;
        if (attemptNumber > MAX_ATTEMPTS) {
            throw new ApiException(HttpStatus.CONFLICT, "All three assessment attempts have been used.");
        }

        Set<String> excluded = new HashSet<>(jdbc.queryForList(
            """
            SELECT q.chunk_key FROM assessment_questions q
            JOIN assessment_attempts a ON a.id = q.attempt_id
            WHERE a.user_id = ? AND a.course_code = ?
            """,
            String.class, userId, course.code()
        ));
        List<QuestionDraft> questions = questionFactory.create(course, excluded);
        UUID attemptId = UUID.randomUUID();
        OffsetDateTime startedAt = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime expiresAt = startedAt.plus(TIME_LIMIT);
        jdbc.update(
            """
            INSERT INTO assessment_attempts (
              id, user_id, course_code, attempt_number, status, started_at, expires_at
            ) VALUES (?, ?, ?, ?, 'IN_PROGRESS', ?, ?)
            """,
            attemptId, userId, course.code(), attemptNumber, startedAt, expiresAt
        );
        for (QuestionDraft question : questions) {
            jdbc.update(
                """
                INSERT INTO assessment_questions (
                  attempt_id, position, chunk_key, module_id, module_title,
                  question_text, options, correct_option
                ) VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?)
                """,
                attemptId, question.position(), question.chunkKey(), question.moduleId(), question.moduleTitle(),
                question.question(), json(question.options()), question.correctOption()
            );
        }
        return attemptView(loadOwnedAttempt(attemptId, userId, course));
    }

    @Transactional
    public SavedAnswer saveAnswer(UUID attemptId, UUID userId, Course course, int position, int selectedOption) {
        if (position < 1 || position > QUESTION_COUNT || selectedOption < 0 || selectedOption > 3) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a valid answer.");
        }
        AttemptRecord attempt = loadOwnedAttempt(attemptId, userId, course);
        requireActiveAndWithinTime(attempt, userId, course);
        int updated = jdbc.update(
            """
            UPDATE assessment_questions SET selected_option = ?
            WHERE attempt_id = ? AND position = ?
            """,
            selectedOption, attemptId, position
        );
        if (updated != 1) throw new ApiException(HttpStatus.NOT_FOUND, "Assessment question not found.");
        return new SavedAnswer(position, selectedOption, true);
    }

    @Transactional
    public AttemptResult submit(UUID attemptId, UUID userId, Course course, List<SubmittedAnswer> answers) {
        AttemptRecord attempt = loadOwnedAttempt(attemptId, userId, course);
        if (!"IN_PROGRESS".equals(attempt.status())) return result(attempt, userId, course);
        if (answers != null) {
            for (SubmittedAnswer answer : answers) {
                if (answer == null || answer.position() < 1 || answer.position() > QUESTION_COUNT
                    || answer.selectedOption() < 0 || answer.selectedOption() > 3) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "The submitted assessment answers are invalid.");
                }
                jdbc.update(
                    "UPDATE assessment_questions SET selected_option = ? WHERE attempt_id = ? AND position = ?",
                    answer.selectedOption(), attemptId, answer.position()
                );
            }
        }
        return grade(attemptId, userId, course, false);
    }

    @Transactional
    public ViolationResult recordViolation(UUID attemptId, UUID userId, Course course, String type) {
        if (!Set.of("visibility", "fullscreen", "pagehide").contains(type)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown assessment warning type.");
        }
        AttemptRecord attempt = loadOwnedAttempt(attemptId, userId, course);
        requireActiveAndWithinTime(attempt, userId, course);
        int warnings = Math.min(MAX_WARNINGS + 1, attempt.warningCount() + 1);
        if (warnings > MAX_WARNINGS) {
            jdbc.update(
                """
                UPDATE assessment_attempts
                SET warning_count = ?, status = 'VOID', score = 0, submitted_at = NOW()
                WHERE id = ? AND status = 'IN_PROGRESS'
                """,
                warnings, attemptId
            );
            return new ViolationResult(warnings, 0, true, "The attempt ended after the third exam-window violation.");
        }
        jdbc.update(
            "UPDATE assessment_attempts SET warning_count = ? WHERE id = ? AND status = 'IN_PROGRESS'",
            warnings, attemptId
        );
        return new ViolationResult(warnings, MAX_WARNINGS - warnings, false,
            "Warning " + warnings + " of " + MAX_WARNINGS + ". Return to fullscreen to continue.");
    }

    private void requireActiveAndWithinTime(AttemptRecord attempt, UUID userId, Course course) {
        if (!"IN_PROGRESS".equals(attempt.status())) {
            throw new ApiException(HttpStatus.CONFLICT, "This assessment attempt has already ended.");
        }
        if (!OffsetDateTime.now(ZoneOffset.UTC).isBefore(attempt.expiresAt())) {
            throw new ApiException(HttpStatus.CONFLICT, "The ten-minute assessment time has ended.");
        }
    }

    private void finishExpiredAttempt(UUID userId, Course course) {
        activeAttempt(userId, course).ifPresent(attempt -> {
            if (!OffsetDateTime.now(ZoneOffset.UTC).isBefore(attempt.expiresAt())) {
                grade(attempt.id(), userId, course, true);
            }
        });
    }

    private AttemptResult grade(UUID attemptId, UUID userId, Course course, boolean timedOut) {
        Integer score = jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM assessment_questions
            WHERE attempt_id = ? AND selected_option = correct_option
            """,
            Integer.class, attemptId
        );
        int finalScore = score == null ? 0 : score;
        String finalStatus = finalScore >= PASSING_SCORE ? "PASSED" : "FAILED";
        jdbc.update(
            """
            UPDATE assessment_attempts
            SET status = ?, score = ?, submitted_at = NOW()
            WHERE id = ? AND user_id = ? AND course_code = ? AND status = 'IN_PROGRESS'
            """,
            finalStatus, finalScore, attemptId, userId, course.code()
        );
        AttemptRecord graded = loadOwnedAttempt(attemptId, userId, course);
        return new AttemptResult(
            graded.id(), graded.attemptNumber(), graded.status(), finalScore, QUESTION_COUNT,
            PASSING_SCORE, "PASSED".equals(finalStatus), timedOut,
            Math.max(0, MAX_ATTEMPTS - attemptCount(userId, course))
        );
    }

    private AttemptResult result(AttemptRecord attempt, UUID userId, Course course) {
        return new AttemptResult(
            attempt.id(), attempt.attemptNumber(), attempt.status(), attempt.score() == null ? 0 : attempt.score(),
            QUESTION_COUNT, PASSING_SCORE, "PASSED".equals(attempt.status()), false,
            Math.max(0, MAX_ATTEMPTS - attemptCount(userId, course))
        );
    }

    private int attemptCount(UUID userId, Course course) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM assessment_attempts WHERE user_id = ? AND course_code = ?",
            Integer.class, userId, course.code()
        );
        return count == null ? 0 : count;
    }

    private Optional<AttemptRecord> activeAttempt(UUID userId, Course course) {
        return jdbc.query(
            """
            SELECT id, attempt_number, status, started_at, expires_at, submitted_at, score, warning_count
            FROM assessment_attempts
            WHERE user_id = ? AND course_code = ? AND status = 'IN_PROGRESS'
            ORDER BY started_at DESC LIMIT 1
            """,
            this::mapAttempt, userId, course.code()
        ).stream().findFirst();
    }

    private AttemptRecord loadOwnedAttempt(UUID attemptId, UUID userId, Course course) {
        return jdbc.query(
            """
            SELECT id, attempt_number, status, started_at, expires_at, submitted_at, score, warning_count
            FROM assessment_attempts
            WHERE id = ? AND user_id = ? AND course_code = ?
            FOR UPDATE
            """,
            this::mapAttempt, attemptId, userId, course.code()
        ).stream().findFirst().orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Assessment attempt not found."));
    }

    private AttemptView attemptView(AttemptRecord attempt) {
        List<QuestionView> questions = jdbc.query(
            """
            SELECT position, module_id, module_title, question_text, options, selected_option
            FROM assessment_questions WHERE attempt_id = ? ORDER BY position
            """,
            (row, rowNumber) -> new QuestionView(
                row.getInt("position"), row.getInt("module_id"), row.getString("module_title"),
                row.getString("question_text"), readOptions(row.getString("options")),
                (Integer) row.getObject("selected_option")
            ),
            attempt.id()
        );
        return new AttemptView(
            attempt.id(), attempt.attemptNumber(), attempt.status(), attempt.startedAt(), attempt.expiresAt(),
            attempt.warningCount(), MAX_WARNINGS, PASSING_SCORE, QUESTION_COUNT, questions
        );
    }

    private AttemptRecord mapAttempt(ResultSet row, int rowNumber) throws SQLException {
        return new AttemptRecord(
            row.getObject("id", UUID.class), row.getInt("attempt_number"), row.getString("status"),
            row.getObject("started_at", OffsetDateTime.class), row.getObject("expires_at", OffsetDateTime.class),
            row.getObject("submitted_at", OffsetDateTime.class), (Integer) row.getObject("score"),
            row.getInt("warning_count")
        );
    }

    private String json(List<String> options) {
        try {
            return mapper.writeValueAsString(options);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Could not store assessment options.", exception);
        }
    }

    private List<String> readOptions(String json) {
        try {
            return List.of(mapper.readValue(json, String[].class));
        } catch (JacksonException exception) {
            throw new IllegalStateException("Could not read assessment options.", exception);
        }
    }

    private record AttemptRecord(
        UUID id,
        int attemptNumber,
        String status,
        OffsetDateTime startedAt,
        OffsetDateTime expiresAt,
        OffsetDateTime submittedAt,
        Integer score,
        int warningCount
    ) {}

    public record AssessmentStatus(
        String course,
        String courseName,
        String coursePath,
        boolean modulesComplete,
        int completedModules,
        int requiredModules,
        boolean passed,
        int attemptsUsed,
        int attemptsRemaining,
        AttemptView activeAttempt
    ) {}

    public record AttemptView(
        UUID id,
        int attemptNumber,
        String status,
        OffsetDateTime startedAt,
        OffsetDateTime expiresAt,
        int warningCount,
        int maximumWarnings,
        int passingScore,
        int questionCount,
        List<QuestionView> questions
    ) {}

    public record QuestionView(
        int position,
        int moduleId,
        String moduleTitle,
        String question,
        List<String> options,
        Integer selectedOption
    ) {}

    public record SubmittedAnswer(int position, int selectedOption) {}

    public record SavedAnswer(int position, int selectedOption, boolean saved) {}

    public record AttemptResult(
        UUID attemptId,
        int attemptNumber,
        String status,
        int score,
        int total,
        int passingScore,
        boolean passed,
        boolean timedOut,
        int attemptsRemaining
    ) {}

    public record ViolationResult(
        int warningCount,
        int warningsRemaining,
        boolean terminated,
        String message
    ) {}
}
