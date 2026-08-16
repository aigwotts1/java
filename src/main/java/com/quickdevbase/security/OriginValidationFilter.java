package com.quickdevbase.security;

import java.io.IOException;
import java.util.Set;

import com.quickdevbase.config.AppSettings;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class OriginValidationFilter extends OncePerRequestFilter {
    private static final Set<String> UNSAFE_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
    private final AppSettings settings;

    public OriginValidationFilter(AppSettings settings) {
        this.settings = settings;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        if (!UNSAFE_METHODS.contains(request.getMethod()) || origin == null || origin.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        String allowed = settings.configuredOrigin();
        if (allowed.isBlank()) {
            String defaultPort = request.isSecure() ? "443" : "80";
            String port = Integer.toString(request.getServerPort());
            allowed = request.getScheme() + "://" + request.getServerName() + (defaultPort.equals(port) ? "" : ":" + port);
        }
        if (!origin.equals(allowed)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Request origin is not allowed.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
