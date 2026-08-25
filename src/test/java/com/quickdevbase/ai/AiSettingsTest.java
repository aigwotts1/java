package com.quickdevbase.ai;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class AiSettingsTest {
    @Test
    void isDisabledWithoutAKeyAndUsesBoundedDefaults() {
        AiSettings settings = new AiSettings(new MockEnvironment());

        assertFalse(settings.enabled());
        assertEquals("gemini-3.5-flash-lite", settings.model());
        assertEquals("gemini-embedding-2", settings.embeddingModel());
        assertFalse(settings.ragEnabled());
        assertEquals(0.55, settings.semanticThreshold());
        assertEquals(20, settings.dailyLimit());
        assertEquals(5, settings.minuteLimit());
        assertEquals(200, settings.globalDailyLimit());
        assertEquals(450, settings.maxOutputTokens());
        assertDoesNotThrow(() -> settings.run(null));
    }

    @Test
    void enablesOnlyWithAValidServerConfiguration() {
        AiSettings settings = new AiSettings(new MockEnvironment()
            .withProperty("GEMINI_API_KEY", "server-secret")
            .withProperty("GEMINI_MODEL", "gemini-3.5-flash-lite")
            .withProperty("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
            .withProperty("AI_DAILY_LIMIT", "12"));

        assertTrue(settings.enabled());
        assertTrue(settings.ragEnabled());
        assertEquals(12, settings.dailyLimit());
        assertDoesNotThrow(() -> settings.run(null));
    }

    @Test
    void rejectsUnsafeModelsAndUnboundedLimits() {
        AiSettings unsafeModel = new AiSettings(new MockEnvironment()
            .withProperty("GEMINI_MODEL", "../../secret"));
        assertThrows(IllegalStateException.class, () -> unsafeModel.run(null));

        AiSettings excessiveLimit = new AiSettings(new MockEnvironment()
            .withProperty("AI_DAILY_LIMIT", "10000"));
        assertThrows(IllegalStateException.class, () -> excessiveLimit.run(null));

        AiSettings invalidThreshold = new AiSettings(new MockEnvironment()
            .withProperty("RAG_SEMANTIC_THRESHOLD", "1.5"));
        assertThrows(IllegalStateException.class, () -> invalidThreshold.run(null));
    }
}
