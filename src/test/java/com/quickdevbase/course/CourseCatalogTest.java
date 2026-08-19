package com.quickdevbase.course;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class CourseCatalogTest {
    private final CourseCatalog courses = new CourseCatalog();

    @Test
    void keepsAllCourseScopesAndCountsStable() {
        assertEquals(18, courses.byKeyOrJava("java").moduleCount());
        assertEquals(148, courses.byKeyOrJava("java").conceptCount());
        assertEquals(126, courses.byKeyOrJava("docker").conceptCount());
        assertEquals(126, courses.byKeyOrJava("python").conceptCount());
        assertEquals(18, courses.byKeyOrJava("sql").moduleCount());
        assertEquals(126, courses.byKeyOrJava("sql").conceptCount());
        assertEquals(12, courses.byKeyOrJava("generative-ai").moduleCount());
        assertEquals(12, courses.byKeyOrJava("rag").moduleCount());
        assertEquals(84, courses.byKeyOrJava("agentic-ai").conceptCount());
        assertEquals("Java Topics at a Glance", courses.byKeyOrJava("java").title());
        assertEquals("RAG Systems Topics at a Glance", courses.byKeyOrJava("rag").title());
        assertEquals("SQL Topics at a Glance", courses.byKeyOrJava("sql").title());
    }

    @Test
    void defaultsUnknownCourseKeysToJavaForBackwardCompatibility() {
        assertEquals("java", courses.byKeyOrJava("unknown").key());
        assertEquals("docker", courses.byCode("docker-developer-knowledge").orElseThrow().key());
        assertEquals("sql", courses.byCode("sql-developer-knowledge").orElseThrow().key());
    }
}
