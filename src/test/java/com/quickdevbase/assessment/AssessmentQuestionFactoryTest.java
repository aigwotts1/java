package com.quickdevbase.assessment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import java.util.stream.Collectors;

import com.quickdevbase.ai.KnowledgeCatalog;
import com.quickdevbase.course.CourseCatalog;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class AssessmentQuestionFactoryTest {
    private final CourseCatalog courses = new CourseCatalog();
    private final KnowledgeCatalog catalog = new KnowledgeCatalog(new ObjectMapper(), courses);
    private final AssessmentQuestionFactory factory = new AssessmentQuestionFactory(catalog);

    @Test
    void createsFifteenBalancedQuestionsWithoutExposingAnswerMetadata() {
        var questions = factory.create(courses.byKeyOrJava("java"), Set.of());

        assertEquals(15, questions.size());
        assertEquals(15, questions.stream().map(AssessmentQuestionFactory.QuestionDraft::chunkKey).distinct().count());
        assertTrue(questions.stream().allMatch(question -> question.options().size() == 4));
        assertTrue(questions.stream().allMatch(question -> question.correctOption() >= 0 && question.correctOption() <= 3));
        assertTrue(questions.stream().map(AssessmentQuestionFactory.QuestionDraft::moduleId).distinct().count() >= 12);
    }

    @Test
    void retryUsesDifferentConceptsWhileEnoughUnusedCurriculumExists() {
        var first = factory.create(courses.byKeyOrJava("rag"), Set.of());
        Set<String> used = first.stream().map(AssessmentQuestionFactory.QuestionDraft::chunkKey).collect(Collectors.toSet());
        var second = factory.create(courses.byKeyOrJava("rag"), used);

        assertFalse(second.stream().anyMatch(question -> used.contains(question.chunkKey())));
        assertEquals(15, second.size());
    }
}
