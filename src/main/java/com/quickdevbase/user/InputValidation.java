package com.quickdevbase.user;

import java.util.Locale;
import java.util.regex.Pattern;

public final class InputValidation {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private InputValidation() {}

    public static String normalizeEmail(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    public static String validName(String value) {
        String name = value == null ? "" : value.trim().replaceAll("\\s+", " ");
        if (name.length() < 2 || name.length() > 60) {
            throw new InvalidInputException("Name must be between 2 and 60 characters.");
        }
        return name;
    }

    public static String validEmail(String value) {
        String email = normalizeEmail(value);
        if (email.length() > 254 || !EMAIL.matcher(email).matches()) {
            throw new InvalidInputException("Enter a valid email address.");
        }
        return email;
    }

    public static String validPassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 128) {
            throw new InvalidInputException("Password must be between 8 and 128 characters.");
        }
        return password;
    }

    public static class InvalidInputException extends RuntimeException {
        public InvalidInputException(String message) {
            super(message);
        }
    }
}
