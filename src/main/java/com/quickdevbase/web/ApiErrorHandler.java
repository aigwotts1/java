package com.quickdevbase.web;

import java.util.Map;

import com.quickdevbase.security.RateLimitService.RateLimitException;
import com.quickdevbase.ai.AiUsageService.AiDailyLimitException;
import com.quickdevbase.ai.AiUsageService.AiGlobalLimitException;
import com.quickdevbase.user.InputValidation.InvalidInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.quickdevbase.web")
public class ApiErrorHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiErrorHandler.class);

    @ExceptionHandler(InvalidInputException.class)
    ResponseEntity<Map<String, String>> invalidInput(InvalidInputException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, String>> apiError(ApiException exception) {
        return ResponseEntity.status(exception.status()).body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    ResponseEntity<Map<String, String>> duplicate(DuplicateKeyException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "An account with that email already exists."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> invalidJson(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", "Enter valid request data."));
    }

    @ExceptionHandler(RateLimitException.class)
    ResponseEntity<Map<String, String>> rateLimited(RateLimitException exception) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Retry-After", Long.toString(exception.retryAfterSeconds()));
        return new ResponseEntity<>(Map.of("error", exception.getMessage()), headers, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(AiDailyLimitException.class)
    ResponseEntity<Map<String, String>> aiDailyLimit(AiDailyLimitException exception) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Retry-After", Long.toString(exception.retryAfterSeconds()));
        return new ResponseEntity<>(Map.of("error", exception.getMessage()), headers, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(AiGlobalLimitException.class)
    ResponseEntity<Map<String, String>> aiGlobalLimit(AiGlobalLimitException exception) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Retry-After", Long.toString(exception.retryAfterSeconds()));
        return new ResponseEntity<>(Map.of("error", exception.getMessage()), headers, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> unexpected(Exception exception) {
        log.error("Unhandled API error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Something went wrong. Please try again."));
    }
}
