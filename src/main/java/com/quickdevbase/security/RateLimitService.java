package com.quickdevbase.security;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class RateLimitService {
    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void check(String key, int limit, Duration window) {
        long now = System.currentTimeMillis();
        Attempt attempt = attempts.compute(key, (ignored, current) -> {
            if (current == null || current.resetAt() <= now) return new Attempt(1, now + window.toMillis());
            return new Attempt(current.count() + 1, current.resetAt());
        });
        if (attempts.size() > 10_000) attempts.entrySet().removeIf(entry -> entry.getValue().resetAt() <= now);
        if (attempt.count() > limit) {
            throw new RateLimitException(Math.max(1, (attempt.resetAt() - now + 999) / 1000));
        }
    }

    private record Attempt(int count, long resetAt) {}

    public static class RateLimitException extends RuntimeException {
        private final long retryAfterSeconds;

        public RateLimitException(long retryAfterSeconds) {
            super("Too many attempts. Please wait a few minutes and try again.");
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public long retryAfterSeconds() {
            return retryAfterSeconds;
        }
    }
}
