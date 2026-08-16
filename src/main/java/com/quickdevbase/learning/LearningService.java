package com.quickdevbase.learning;

import java.util.List;
import java.util.UUID;

import com.quickdevbase.course.CourseCatalog.Course;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LearningService {
    private final JdbcTemplate jdbc;

    public LearningService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Integer> completedModules(UUID userId, Course course) {
        return jdbc.queryForList(
            "SELECT module_id FROM learning_progress WHERE user_id = ? AND course_code = ? ORDER BY module_id",
            Integer.class,
            userId, course.code()
        );
    }

    public int completedCount(UUID userId, Course course) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM learning_progress WHERE user_id = ? AND course_code = ?",
            Integer.class,
            userId, course.code()
        );
        return count == null ? 0 : count;
    }

    @Transactional
    public int save(UUID userId, Course course, int moduleId, boolean completed) {
        if (completed) {
            jdbc.update(
                """
                INSERT INTO learning_progress (user_id, course_code, module_id)
                VALUES (?, ?, ?)
                ON CONFLICT (user_id, course_code, module_id) DO UPDATE SET completed_at = NOW()
                """,
                userId, course.code(), moduleId
            );
        } else {
            jdbc.update(
                "DELETE FROM learning_progress WHERE user_id = ? AND course_code = ? AND module_id = ?",
                userId, course.code(), moduleId
            );
        }
        return completedCount(userId, course);
    }
}
