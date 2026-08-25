package com.quickdevbase.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

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
    private final UUID userId = UUID.randomUUID();
    private AiDiscoveryService discovery;

    @BeforeEach
    void setUp() {
        when(settings.dailyLimit()).thenReturn(20);
        when(settings.minuteLimit()).thenReturn(5);
        when(settings.globalDailyLimit()).thenReturn(200);
        when(settings.model()).thenReturn("gemini-test");
        when(usage.remaining(userId, 20)).thenReturn(20);
        discovery = new AiDiscoveryService(settings, gemini, usage, rateLimits, catalog);
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
