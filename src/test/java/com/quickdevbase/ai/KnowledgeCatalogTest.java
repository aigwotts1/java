package com.quickdevbase.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.quickdevbase.course.CourseCatalog;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class KnowledgeCatalogTest {
    private final KnowledgeCatalog catalog = new KnowledgeCatalog(new ObjectMapper(), new CourseCatalog());

    @Test
    void loadsEveryConceptFromEveryPublishedCourse() {
        assertEquals(778, catalog.conceptCount());
        assertEquals(778, catalog.allChunks().stream().map(KnowledgeCatalog.KnowledgeChunk::chunkKey).distinct().count());
        assertTrue(catalog.allChunks().stream().allMatch(chunk -> chunk.contentHash().length() == 64));
    }

    @Test
    void retrievesLanguageContainerAndDatabaseLessonsWithCourseSpecificLinks() {
        assertMatch("How does CompletableFuture run asynchronous Java work?", "java", 6, "CompletableFuture", "/java?");
        assertMatch("Explain the Docker Compose application model", "docker", 11, "Compose application model", "/docker?");
        assertMatch("How do Python async and await coroutines work?", "python", 15, "async & await", "/python?");
        assertMatch("Use SQL EXPLAIN ANALYZE for query performance", "sql", 15, "EXPLAIN ANALYZE", "/sql?");
    }

    @Test
    void retrievesEachAiLearningPathIndependently() {
        assertMatch("Explain generative AI transformer architecture", "generative-ai", 3,
            "Transformer architecture", "/ai/generative-ai?");
        assertMatch("How does reciprocal rank fusion work in RAG?", "rag", 7,
            "Reciprocal rank fusion", "/ai/rag?");
        assertMatch("Protect an agentic AI system from indirect prompt injection", "agentic-ai", 12,
            "Indirect prompt injection", "/ai/agents?");
    }

    @Test
    void refusesToPretendUnrelatedTextHasACourseMatch() {
        assertTrue(catalog.search("renaissance oil painting and ocean tides", 3).isEmpty());
    }

    private void assertMatch(String query, String course, int moduleId, String topic, String pathPrefix) {
        var matches = catalog.search(query, 3);

        assertFalse(matches.isEmpty(), query);
        var first = matches.get(0);
        assertEquals(course, first.course(), query);
        assertEquals(moduleId, first.moduleId(), query);
        assertTrue(first.matchedConcepts().contains(topic), query);
        assertTrue(first.path().startsWith(pathPrefix + "module=" + moduleId), first.path());
        assertTrue(first.sourceLabel().startsWith("QuickDevBase "), first.sourceLabel());
    }
}
