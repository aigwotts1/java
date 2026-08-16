package com.quickdevbase.security;

import java.io.IOException;
import java.util.List;

import com.quickdevbase.config.AppSettings;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

@Component
public class LegacySessionAuthenticationFilter extends OncePerRequestFilter {
    private final SessionService sessions;

    public LegacySessionAuthenticationFilter(SessionService sessions) {
        this.sessions = sessions;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            Cookie cookie = WebUtils.getCookie(request, AppSettings.SESSION_COOKIE);
            if (cookie != null) {
                sessions.findUser(cookie.getValue()).ifPresentOrElse(user -> {
                    UserPrincipal principal = new UserPrincipal(user);
                    SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(principal, null, List.of())
                    );
                }, () -> sessions.clearCookie(response));
            }
        }
        chain.doFilter(request, response);
    }
}
