package com.quickdevbase.ai;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiUsageService {
    private final JdbcTemplate jdbc;

    public AiUsageService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<CachedAnswer> cached(String cacheKey) {
        return jdbc.query(
            """
            SELECT answer, input_tokens, output_tokens
            FROM ai_answer_cache
            WHERE cache_key = ? AND expires_at > NOW()
            """,
            (row, index) -> new CachedAnswer(
                row.getString("answer"),
                row.getInt("input_tokens"),
                row.getInt("output_tokens")
            ),
            cacheKey
        ).stream().findFirst();
    }

    public void cache(String cacheKey, String model, GeminiClient.GeminiAnswer answer, int cacheDays) {
        jdbc.update(
            """
            INSERT INTO ai_answer_cache (cache_key, model, answer, input_tokens, output_tokens, expires_at)
            VALUES (?, ?, ?, ?, ?, NOW() + (? * INTERVAL '1 day'))
            ON CONFLICT (cache_key) DO UPDATE SET
              model = EXCLUDED.model,
              answer = EXCLUDED.answer,
              input_tokens = EXCLUDED.input_tokens,
              output_tokens = EXCLUDED.output_tokens,
              created_at = NOW(),
              expires_at = EXCLUDED.expires_at
            """,
            cacheKey, model, answer.answer(), answer.inputTokens(), answer.outputTokens(), cacheDays
        );
    }

    @Transactional
    public int consume(UUID userId, int dailyLimit, int globalDailyLimit) {
        List<Integer> counts = jdbc.query(
            """
            INSERT INTO ai_usage_daily (user_id, usage_date, request_count)
            VALUES (?, (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date, 1)
            ON CONFLICT (user_id, usage_date) DO UPDATE SET
              request_count = ai_usage_daily.request_count + 1,
              updated_at = NOW()
            WHERE ai_usage_daily.request_count < ?
            RETURNING request_count
            """,
            (row, index) -> row.getInt("request_count"),
            userId, dailyLimit
        );
        if (counts.isEmpty()) throw new AiDailyLimitException(secondsUntilUtcMidnight());

        List<Integer> globalCounts = jdbc.query(
            """
            INSERT INTO ai_provider_usage_daily (usage_date, request_count)
            VALUES ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date, 1)
            ON CONFLICT (usage_date) DO UPDATE SET
              request_count = ai_provider_usage_daily.request_count + 1,
              updated_at = NOW()
            WHERE ai_provider_usage_daily.request_count < ?
            RETURNING request_count
            """,
            (row, index) -> row.getInt("request_count"),
            globalDailyLimit
        );
        if (globalCounts.isEmpty()) throw new AiGlobalLimitException(secondsUntilUtcMidnight());
        return counts.get(0);
    }

    public int remaining(UUID userId, int dailyLimit) {
        Integer used = jdbc.queryForObject(
            """
            SELECT COALESCE(MAX(request_count), 0)
            FROM ai_usage_daily
            WHERE user_id = ? AND usage_date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date
            """,
            Integer.class,
            userId
        );
        return Math.max(0, dailyLimit - (used == null ? 0 : used));
    }

    @EventListener(ApplicationReadyEvent.class)
    void removeExpiredData() {
        jdbc.update("DELETE FROM ai_answer_cache WHERE expires_at <= NOW()");
        jdbc.update("DELETE FROM ai_usage_daily WHERE usage_date < ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 90)");
        jdbc.update("DELETE FROM ai_provider_usage_daily WHERE usage_date < ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 90)");
    }

    private static long secondsUntilUtcMidnight() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return Math.max(1, java.time.Duration.between(now, now.toLocalDate().plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC)).getSeconds());
    }

    record CachedAnswer(String answer, int inputTokens, int outputTokens) {}

    public static class AiDailyLimitException extends RuntimeException {
        private final long retryAfterSeconds;

        AiDailyLimitException(long retryAfterSeconds) {
            super("You have used today's AI guide allowance. It resets at midnight UTC.");
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public long retryAfterSeconds() {
            return retryAfterSeconds;
        }
    }

    public static class AiGlobalLimitException extends RuntimeException {
        private final long retryAfterSeconds;

        AiGlobalLimitException(long retryAfterSeconds) {
            super("Ask QuickDev has reached today's site-wide allowance. It resets at midnight UTC.");
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public long retryAfterSeconds() {
            return retryAfterSeconds;
        }
    }
}
