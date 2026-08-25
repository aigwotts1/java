package com.quickdevbase.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;
import java.util.stream.IntStream;

import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.security.RateLimitService;
import com.quickdevbase.web.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import tools.jackson.databind.ObjectMapper;

class AiDiscoveryServiceTest {
    private final AiSettings settings = mock(AiSettings.class);
    private final GeminiClient gemini = mock(GeminiClient.class);
    private final AiUsageService usage = mock(AiUsageService.class);
    private final RateLimitService rateLimits = mock(RateLimitService.class);
    private final KnowledgeCatalog catalog = new KnowledgeCatalog(new ObjectMapper(), new CourseCatalog());
    private final KnowledgeVectorStore vectors = mock(KnowledgeVectorStore.class);
    private final HybridKnowledgeRetriever retriever = new HybridKnowledgeRetriever(catalog, vectors, gemini, settings);
    private final RagPromptFactory ragPrompts = new RagPromptFactory();
    private final UUID userId = UUID.randomUUID();
    private AiDiscoveryService discovery;

    @BeforeEach
    void setUp() {
        when(settings.dailyLimit()).thenReturn(20);
        when(settings.minuteLimit()).thenReturn(5);
        when(settings.globalDailyLimit()).thenReturn(200);
        when(settings.model()).thenReturn("gemini-test");
        when(settings.embeddingModel()).thenReturn("gemini-embedding-test");
        when(settings.semanticThreshold()).thenReturn(0.55);
        when(usage.remaining(userId, 20)).thenReturn(20);
        discovery = new AiDiscoveryService(settings, gemini, usage, rateLimits, retriever, ragPrompts);
    }

    @Test
    void searchesByTextWithoutCallingTheProvider() {
        var result = discovery.discover(userId, null, "Use SQL EXPLAIN ANALYZE for query performance");

        assertFalse(result.usedImage());
        assertEquals("EXPLAIN ANALYZE", result.detectedTopic());
        assertEquals("sql", result.matches().get(0).course());
        assertEquals(15, result.matches().get(0).moduleId());
        verify(gemini, never()).extractEducationalText(any(), anyString());
        verify(usage, never()).consume(any(), anyInt(), anyInt());
    }

    @Test
    void fusesSemanticRetrievalAndGeneratesOnlyFromRetrievedCurriculum() {
        when(settings.enabled()).thenReturn(true);
        when(settings.ragEnabled()).thenReturn(true);
        when(usage.consume(userId, 20, 200)).thenReturn(1);
        when(vectors.indexedCount("gemini-embedding-test")).thenReturn(778);
        var semanticChunk = catalog.rankedSearch("Python async and await", 1).get(0).chunk();
        var embedding = IntStream.range(0, 768).mapToObj(index -> 0.001).toList();
        when(gemini.embedQuery(anyString())).thenReturn(embedding);
        when(vectors.semanticSearch(anyList(), eq("gemini-embedding-test"), eq(20), eq(0.55)))
            .thenReturn(java.util.List.of(new KnowledgeVectorStore.SemanticHit(semanticChunk.chunkKey(), 0.84)));
        when(gemini.generate(eq(RagPromptFactory.SYSTEM_PROMPT), anyString()))
            .thenReturn(new GeminiClient.GeminiAnswer("Python coroutines yield control with await. [1]", 100, 20));

        var result = discovery.discover(userId, null, "How can Python pause work without blocking?");

        assertTrue(result.generated());
        assertEquals("hybrid", result.retrievalMode());
        assertEquals("Python coroutines yield control with await. [1]", result.answer());
        assertTrue(result.matches().stream().anyMatch(match -> match.course().equals("python")));
        verify(usage).consume(userId, 20, 200);
    }

    @Test
    void extractsAnImageThenRetrievesOnlyServerOwnedCourseMatches() {
        when(settings.enabled()).thenReturn(true);
        when(usage.consume(userId, 20, 200)).thenReturn(1);
        when(gemini.extractEducationalText(any(), anyString()))
            .thenReturn(new GeminiClient.GeminiAnswer(
                "Docker Compose services, images, networks, and named volumes", 40, 12));
        byte[] png = new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1};
        var image = new MockMultipartFile("image", "notes.png", "image/png", png);

        var result = discovery.discover(userId, image, "What topic is this?");

        assertTrue(result.usedImage());
        assertEquals("gemini-test", result.model());
        assertEquals(19, result.remainingToday());
        assertEquals("docker", result.matches().get(0).course());
        assertTrue(result.matches().stream().allMatch(match -> match.sourceLabel().startsWith("QuickDevBase ")));
        verify(gemini).extractEducationalText(any(), org.mockito.ArgumentMatchers.eq("image/png"));
    }

    @Test
    void rejectsFilesByTheirActualBytesInsteadOfTrustingTheClaimedType() {
        when(settings.enabled()).thenReturn(true);
        var fake = new MockMultipartFile("image", "notes.png", "image/png", "not an image".getBytes());

        ApiException exception = assertThrows(ApiException.class, () -> discovery.discover(userId, fake, "Java"));

        assertEquals(415, exception.status().value());
        verify(gemini, never()).extractEducationalText(any(), anyString());
    }
}
