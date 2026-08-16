package com.quickdevbase.web;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import com.quickdevbase.config.AppSettings;
import com.quickdevbase.security.RateLimitService;
import com.quickdevbase.security.SessionService;
import com.quickdevbase.security.UserPrincipal;
import com.quickdevbase.user.AuthService;
import com.quickdevbase.user.InputValidation;
import com.quickdevbase.user.PasswordService;
import com.quickdevbase.user.UserAccount;
import com.quickdevbase.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService auth;
    private final UserRepository users;
    private final PasswordService passwords;
    private final SessionService sessions;
    private final RateLimitService limits;

    public AuthController(
        AuthService auth,
        UserRepository users,
        PasswordService passwords,
        SessionService sessions,
        RateLimitService limits
    ) {
        this.auth = auth;
        this.users = users;
        this.passwords = passwords;
        this.sessions = sessions;
        this.limits = limits;
    }

    @PostMapping("/auth/register")
    ResponseEntity<Map<String, Object>> register(
        @RequestBody(required = false) Registration body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        Registration input = body == null ? new Registration(null, null, null) : body;
        limits.check("auth:" + clientIp(request) + ":" + InputValidation.normalizeEmail(input.email()), 12, Duration.ofMinutes(15));
        AuthService.AuthenticatedUser result = auth.register(input.name(), input.email(), input.password());
        sessions.setCookie(response, result.sessionToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("user", result.user().publicView()));
    }

    @PostMapping("/auth/login")
    Map<String, Object> login(
        @RequestBody(required = false) Login body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        Login input = body == null ? new Login(null, null) : body;
        limits.check("auth:" + clientIp(request) + ":" + InputValidation.normalizeEmail(input.email()), 12, Duration.ofMinutes(15));
        AuthService.AuthenticatedUser result = auth.login(input.email(), input.password())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect."));
        sessions.setCookie(response, result.sessionToken());
        return Map.of("user", result.user().publicView());
    }

    @PostMapping("/auth/logout")
    ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = WebUtils.getCookie(request, AppSettings.SESSION_COOKIE);
        if (cookie != null) sessions.revoke(cookie.getValue());
        sessions.clearCookie(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/auth/me")
    Map<String, Object> me(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> response = new HashMap<>();
        response.put("user", principal == null ? null : principal.account().publicView());
        return response;
    }

    @PatchMapping("/profile")
    Map<String, Object> profile(@AuthenticationPrincipal UserPrincipal principal, @RequestBody(required = false) Profile body) {
        String name = InputValidation.validName(body == null ? null : body.name());
        UserAccount user = users.rename(principal.account().id(), name);
        return Map.of("user", user.publicView());
    }

    @DeleteMapping("/account")
    ResponseEntity<Void> deleteAccount(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody(required = false) DeleteAccount body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        limits.check("delete:" + clientIp(request) + ":" + principal.account().id(), 6, Duration.ofMinutes(15));
        if (body == null || !"DELETE".equals(body.confirmation())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Type DELETE to confirm permanent account deletion.");
        }
        if (body.password() == null || body.password().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Enter your password to delete your account.");
        }
        UserAccount current = users.findById(principal.account().id())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Password is incorrect."));
        if (!passwords.matches(body.password(), current.passwordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Password is incorrect.");
        }
        users.delete(current.id());
        sessions.clearCookie(response);
        return ResponseEntity.noContent().build();
    }

    private static String clientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    public record Registration(String name, String email, String password) {}
    public record Login(String email, String password) {}
    public record Profile(String name) {}
    public record DeleteAccount(String confirmation, String password) {}
}
