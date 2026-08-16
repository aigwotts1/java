package com.quickdevbase.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class AppSettingsTest {
    @Test
    void acceptsAProductionHttpsConfiguration() {
        AppSettings settings = new AppSettings(new MockEnvironment()
            .withProperty("APP_ORIGIN", "https://learn.example.com")
            .withProperty("PUBLIC_APP_URL", "https://learn.example.com/")
            .withProperty("COOKIE_SECURE", "true")
            .withProperty("ENFORCE_HTTPS", "true"));

        assertDoesNotThrow(() -> settings.run(null));
    }

    @Test
    void rejectsUnsafeOrIncompletePublicConfiguration() {
        AppSettings unsafe = new AppSettings(new MockEnvironment().withProperty("PUBLIC_APP_URL", "javascript:alert(1)"));
        assertThrows(IllegalStateException.class, () -> unsafe.run(null));

        AppSettings insecureCookies = new AppSettings(new MockEnvironment()
            .withProperty("PUBLIC_APP_URL", "https://learn.example.com")
            .withProperty("ENFORCE_HTTPS", "true"));
        assertThrows(IllegalStateException.class, () -> insecureCookies.run(null));
    }
}
