package com.quickdevbase.config;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class AppSettings implements ApplicationRunner {
    public static final String SESSION_COOKIE = "java_basecamp_session";
    public static final String CONSENT_VERSION = "2026-09-03";

    private final Environment environment;

    public AppSettings(Environment environment) {
        this.environment = environment;
    }

    public int sessionDays() {
        return Math.max(1, environment.getProperty("SESSION_DAYS", Integer.class, 30));
    }

    public Duration sessionLifetime() {
        return Duration.ofDays(sessionDays());
    }

    public boolean secureCookies() {
        return environment.getProperty("COOKIE_SECURE", Boolean.class, false);
    }

    public boolean enforceHttps() {
        return environment.getProperty("ENFORCE_HTTPS", Boolean.class, false);
    }

    public String configuredOrigin() {
        return trimTrailingSlash(environment.getProperty("APP_ORIGIN", ""));
    }

    public String publicAppUrl() {
        return trimTrailingSlash(environment.getProperty("PUBLIC_APP_URL", ""));
    }

    private static String trimTrailingSlash(String value) {
        return value == null ? "" : value.trim().replaceFirst("/+$", "");
    }

    @Override
    public void run(ApplicationArguments args) {
        validateOrigin("APP_ORIGIN", configuredOrigin());
        validateOrigin("PUBLIC_APP_URL", publicAppUrl());
        if (!enforceHttps()) return;
        String publicUrl = publicAppUrl();
        if (!secureCookies() || publicUrl.isBlank() || !"https".equalsIgnoreCase(URI.create(publicUrl).getScheme())) {
            throw new IllegalStateException(
                "ENFORCE_HTTPS=true requires COOKIE_SECURE=true and an HTTPS PUBLIC_APP_URL."
            );
        }
    }

    private static void validateOrigin(String name, String value) {
        if (value.isBlank()) return;
        URI uri;
        try {
            uri = URI.create(value);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(name + " must be a valid http:// or https:// origin.", exception);
        }
        boolean validScheme = "http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme());
        boolean originOnly = (uri.getPath() == null || uri.getPath().isBlank() || "/".equals(uri.getPath()))
            && uri.getQuery() == null && uri.getFragment() == null && uri.getUserInfo() == null;
        if (!validScheme || uri.getHost() == null || !originOnly) {
            throw new IllegalStateException(name + " must be a valid http:// or https:// origin.");
        }
    }
}
