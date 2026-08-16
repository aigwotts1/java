package com.quickdevbase.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import com.quickdevbase.config.AppSettings;
import com.quickdevbase.user.UserAccount;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SessionService {
    private final JdbcTemplate jdbc;
    private final AppSettings settings;
    private final SecureRandom secureRandom = new SecureRandom();

    public SessionService(JdbcTemplate jdbc, AppSettings settings) {
        this.jdbc = jdbc;
        this.settings = settings;
    }

    public String create(UUID userId) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plus(settings.sessionLifetime());
        jdbc.update("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", hash(token), userId, expiresAt);
        return token;
    }

    public Optional<UserAccount> findUser(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        return jdbc.query(
            """
            SELECT u.id, u.name, u.email, u.password_hash, u.created_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = ? AND s.expires_at > NOW()
            """,
            (row, index) -> new UserAccount(
                row.getObject("id", UUID.class),
                row.getString("name"),
                row.getString("email"),
                row.getString("password_hash"),
                row.getObject("created_at", OffsetDateTime.class)
            ),
            hash(token)
        ).stream().findFirst();
    }

    public void revoke(String token) {
        if (token != null && !token.isBlank()) jdbc.update("DELETE FROM sessions WHERE token_hash = ?", hash(token));
    }

    public void setCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(AppSettings.SESSION_COOKIE, token)
            .httpOnly(true)
            .secure(settings.secureCookies())
            .sameSite("Lax")
            .path("/")
            .maxAge(settings.sessionLifetime())
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(AppSettings.SESSION_COOKIE, "")
            .httpOnly(true)
            .secure(settings.secureCookies())
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void removeExpiredSessions() {
        jdbc.update("DELETE FROM sessions WHERE expires_at <= NOW()");
    }
}
