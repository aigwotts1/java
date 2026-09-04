package com.quickdevbase.certificate;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import com.quickdevbase.assessment.AssessmentService;
import com.quickdevbase.config.AppSettings;
import com.quickdevbase.course.CourseCatalog.Course;
import com.quickdevbase.learning.LearningService;
import com.quickdevbase.user.InputValidation;
import com.quickdevbase.user.UserAccount;
import com.quickdevbase.user.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CertificateService {
    private final JdbcTemplate jdbc;
    private final LearningService learning;
    private final AssessmentService assessments;
    private final UserRepository users;
    private final SecureRandom random = new SecureRandom();

    public CertificateService(
        JdbcTemplate jdbc,
        LearningService learning,
        AssessmentService assessments,
        UserRepository users
    ) {
        this.jdbc = jdbc;
        this.learning = learning;
        this.assessments = assessments;
        this.users = users;
    }

    public Optional<CertificateRecord> findForUser(UUID userId, Course course) {
        return jdbc.query(
            selectSql("c.user_id = ? AND c.course_code = ?"),
            this::map,
            userId, course.code()
        ).stream().findFirst();
    }

    public Optional<CertificateRecord> findPublicById(String publicId) {
        return jdbc.query(
            selectSql("c.public_id = ? AND c.is_public = TRUE"),
            this::map,
            publicId
        ).stream().findFirst();
    }

    public Optional<CertificateRecord> findPublicByHash(String hash) {
        return jdbc.query(
            selectSql("c.verification_hash = ? AND c.is_public = TRUE"),
            this::map,
            hash
        ).stream().findFirst();
    }

    public CertificateStatus status(UUID userId, Course course) {
        int count = learning.completedCount(userId, course);
        Optional<CertificateRecord> certificate = findForUser(userId, course);
        boolean modulesComplete = count >= course.moduleCount();
        AssessmentService.AssessmentStatus assessment = assessments.status(userId, course);
        boolean assessmentPassed = certificate.isPresent() || assessment.passed();
        boolean eligible = certificate.isPresent() || (modulesComplete && assessmentPassed);
        return new CertificateStatus(
            certificate.orElse(null), count, eligible, modulesComplete, assessmentPassed,
            assessment.attemptsUsed(), assessment.attemptsRemaining()
        );
    }

    @Transactional
    public ClaimResult claim(UserAccount user, Course course, String requestedName) {
        int completedCount = learning.completedCount(user.id(), course);
        Optional<CertificateRecord> existing = findForUser(user.id(), course);
        boolean assessmentPassed = existing.isPresent() || assessments.hasPassed(user.id(), course);
        if (existing.isEmpty() && (completedCount < course.moduleCount() || !assessmentPassed)) {
            return ClaimResult.ineligible(completedCount, assessmentPassed);
        }

        String publicName = InputValidation.validName(requestedName == null || requestedName.isBlank() ? user.name() : requestedName);
        UserAccount renamed = users.rename(user.id(), publicName);
        if (existing.isPresent()) {
            jdbc.update(
                """
                UPDATE certificates
                SET is_public = TRUE, published_at = NOW(), unpublished_at = NULL,
                    consented_at = NOW(), consent_version = ?
                WHERE user_id = ? AND course_code = ?
                """,
                AppSettings.CONSENT_VERSION, user.id(), course.code()
            );
            CertificateRecord certificate = findForUser(user.id(), course).orElseThrow();
            return new ClaimResult(certificate, renamed, completedCount, false, !existing.get().isPublic(), true, true);
        }

        int inserted = jdbc.update(
            """
            INSERT INTO certificates (
              id, public_id, verification_hash, user_id, course_code,
              is_public, published_at, consented_at, consent_version
            ) VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW(), ?)
            ON CONFLICT (user_id, course_code) DO NOTHING
            """,
            UUID.randomUUID(), randomPublicId(), randomVerificationHash(), user.id(), course.code(), AppSettings.CONSENT_VERSION
        );
        CertificateRecord certificate = findForUser(user.id(), course).orElseThrow();
        return new ClaimResult(certificate, renamed, completedCount, inserted == 1, inserted == 1, true, true);
    }

    public Optional<CertificateRecord> unpublish(UUID userId, Course course) {
        int updated = jdbc.update(
            "UPDATE certificates SET is_public = FALSE, unpublished_at = NOW() WHERE user_id = ? AND course_code = ?",
            userId, course.code()
        );
        return updated == 0 ? Optional.empty() : findForUser(userId, course);
    }

    private String randomPublicId() {
        byte[] bytes = new byte[18];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String randomVerificationHash() {
        byte[] bytes = new byte[64];
        random.nextBytes(bytes);
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private String selectSql(String predicate) {
        return """
            SELECT c.id, c.public_id, c.verification_hash, c.user_id, c.course_code, c.issued_at,
                   c.is_public, c.published_at, c.unpublished_at, u.name AS user_name
            FROM certificates c
            JOIN users u ON u.id = c.user_id
            WHERE
            """ + predicate;
    }

    private CertificateRecord map(ResultSet row, int rowNumber) throws SQLException {
        return new CertificateRecord(
            row.getObject("id", UUID.class),
            row.getString("public_id"),
            row.getString("verification_hash"),
            row.getObject("user_id", UUID.class),
            row.getString("user_name"),
            row.getString("course_code"),
            row.getObject("issued_at", OffsetDateTime.class),
            row.getBoolean("is_public"),
            row.getObject("published_at", OffsetDateTime.class),
            row.getObject("unpublished_at", OffsetDateTime.class)
        );
    }

    public record CertificateStatus(
        CertificateRecord certificate,
        int completedCount,
        boolean eligible,
        boolean modulesComplete,
        boolean assessmentPassed,
        int assessmentAttemptsUsed,
        int assessmentAttemptsRemaining
    ) {}

    public record ClaimResult(
        CertificateRecord certificate,
        UserAccount user,
        int completedCount,
        boolean newlyIssued,
        boolean newlyPublished,
        boolean eligible,
        boolean assessmentPassed
    ) {
        static ClaimResult ineligible(int count, boolean assessmentPassed) {
            return new ClaimResult(null, null, count, false, false, false, assessmentPassed);
        }
    }
}
