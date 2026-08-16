package com.quickdevbase.user;

import java.util.Optional;
import java.util.UUID;

import com.quickdevbase.security.SessionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordService passwords;
    private final SessionService sessions;

    public AuthService(UserRepository users, PasswordService passwords, SessionService sessions) {
        this.users = users;
        this.passwords = passwords;
        this.sessions = sessions;
    }

    @Transactional
    public AuthenticatedUser register(String name, String email, String password) {
        String cleanName = InputValidation.validName(name);
        String cleanEmail = InputValidation.validEmail(email);
        String cleanPassword = InputValidation.validPassword(password);
        UserAccount user = users.create(UUID.randomUUID(), cleanName, cleanEmail, passwords.hash(cleanPassword));
        return new AuthenticatedUser(user, sessions.create(user.id()));
    }

    @Transactional
    public Optional<AuthenticatedUser> login(String email, String password) {
        String cleanEmail = InputValidation.normalizeEmail(email);
        String cleanPassword = password == null ? "" : password;
        if (cleanEmail.isBlank() || cleanPassword.isBlank()) {
            throw new InputValidation.InvalidInputException("Email and password are required.");
        }

        Optional<UserAccount> candidate = users.findByEmail(cleanEmail);
        if (candidate.isEmpty() || !passwords.matches(cleanPassword, candidate.get().passwordHash())) return Optional.empty();

        UserAccount user = candidate.get();
        if (passwords.needsUpgrade(user.passwordHash())) {
            String upgraded = passwords.hash(cleanPassword);
            users.updatePasswordHash(user.id(), upgraded);
            user = new UserAccount(user.id(), user.name(), user.email(), upgraded, user.createdAt());
        }
        return Optional.of(new AuthenticatedUser(user, sessions.create(user.id())));
    }

    public record AuthenticatedUser(UserAccount user, String sessionToken) {}
}
