package com.quickdevbase.security;

import java.io.IOException;
import java.util.Set;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class PayloadSizeFilter extends OncePerRequestFilter {
    private static final long MAX_API_BODY_BYTES = 32 * 1024;
    private static final long MAX_DISCOVERY_BODY_BYTES = 6L * 1024 * 1024;
    private static final Set<String> BODY_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        long maximum = request.getRequestURI().equals("/api/ai/discover")
            ? MAX_DISCOVERY_BODY_BYTES
            : MAX_API_BODY_BYTES;
        if (request.getRequestURI().startsWith("/api/")
            && BODY_METHODS.contains(request.getMethod())
            && request.getContentLengthLong() > maximum) {
            response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Request body is too large.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
