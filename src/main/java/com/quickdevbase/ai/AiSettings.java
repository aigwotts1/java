package com.quickdevbase.ai;

import java.time.Duration;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class AiSettings implements ApplicationRunner {
    private final Environment environment;

    public AiSettings(Environment environment) {
        this.environment = environment;
    }

    public boolean enabled() {
        return !apiKey().isBlank();
    }

    public String apiKey() {
        return environment.getProperty("GEMINI_API_KEY", "").trim();
    }

    public String model() {
        return environment.getProperty("GEMINI_MODEL", "gemini-3.5-flash-lite").trim();
    }

    public String embeddingModel() {
        return environment.getProperty("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2").trim();
    }

    public int embeddingDimensions() {
        return 768;
    }

    public boolean ragEnabled() {
        return enabled() && environment.getProperty("RAG_ENABLED", Boolean.class, true);
    }

    public double semanticThreshold() {
        double value = environment.getProperty("RAG_SEMANTIC_THRESHOLD", Double.class, 0.55);
        if (!Double.isFinite(value) || value < 0.0 || value > 1.0) {
            throw new IllegalStateException("RAG_SEMANTIC_THRESHOLD must be between 0 and 1.");
        }
        return value;
    }

    public int dailyLimit() {
        return bounded("AI_DAILY_LIMIT", 20, 1, 200);
    }

    public int minuteLimit() {
        return bounded("AI_MINUTE_LIMIT", 5, 1, 30);
    }

    public int globalDailyLimit() {
        return bounded("AI_GLOBAL_DAILY_LIMIT", 200, 1, 100_000);
    }

    public int maxOutputTokens() {
        return bounded("AI_MAX_OUTPUT_TOKENS", 450, 100, 1_000);
    }

    public int cacheDays() {
        return bounded("AI_CACHE_DAYS", 7, 1, 30);
    }

    public Duration timeout() {
        return Duration.ofSeconds(bounded("AI_TIMEOUT_SECONDS", 20, 3, 60));
    }

    private int bounded(String name, int fallback, int minimum, int maximum) {
        int value = environment.getProperty(name, Integer.class, fallback);
        if (value < minimum || value > maximum) {
            throw new IllegalStateException(name + " must be between " + minimum + " and " + maximum + ".");
        }
        return value;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!model().matches("[A-Za-z0-9._-]{3,80}")) {
            throw new IllegalStateException("GEMINI_MODEL contains unsupported characters.");
        }
        if (!embeddingModel().matches("[A-Za-z0-9._-]{3,80}")) {
            throw new IllegalStateException("GEMINI_EMBEDDING_MODEL contains unsupported characters.");
        }
        ragEnabled();
        semanticThreshold();
        dailyLimit();
        minuteLimit();
        globalDailyLimit();
        maxOutputTokens();
        cacheDays();
        timeout();
    }
}
