package com.quickdevbase.security;

import java.io.IOException;

import com.quickdevbase.config.AppSettings;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class HttpsEnforcementFilter extends OncePerRequestFilter {
    private final AppSettings settings;

    public HttpsEnforcementFilter(AppSettings settings) {
        this.settings = settings;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        if (!settings.enforceHttps() || request.isSecure()) {
            chain.doFilter(request, response);
            return;
        }

        if ("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod())) {
            String query = request.getQueryString() == null ? "" : "?" + request.getQueryString();
            response.setStatus(308);
            response.setHeader("Location", settings.publicAppUrl() + request.getRequestURI() + query);
            return;
        }

        response.setStatus(426);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"HTTPS is required.\"}");
    }
}
