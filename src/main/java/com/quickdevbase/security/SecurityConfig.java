package com.quickdevbase.security;

import java.io.IOException;

import com.quickdevbase.config.AppSettings;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.header.HeaderWriterFilter;

@Configuration
public class SecurityConfig {
    @Bean
    UserDetailsService noPasswordBasedFrameworkUsers() {
        return username -> {
            throw new UsernameNotFoundException("Framework-managed users are disabled.");
        };
    }

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        LegacySessionAuthenticationFilter sessionFilter,
        CsrfCookieFilter csrfCookieFilter,
        HttpsEnforcementFilter httpsFilter,
        OriginValidationFilter originFilter,
        PayloadSizeFilter payloadSizeFilter,
        SecurityHeadersFilter securityHeadersFilter,
        AppSettings settings
    ) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookiePath("/");
        csrfRepository.setCookieCustomizer(cookie -> cookie.sameSite("Lax").secure(settings.secureCookies()));
        CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfRepository)
                .csrfTokenRequestHandler(csrfRequestHandler)
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .requestCache(cache -> cache.disable())
            .formLogin(login -> login.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable())
            .cors(cors -> cors.disable())
            .headers(Customizer.withDefaults())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/profile", "/api/account", "/api/progress/**", "/api/certificate", "/api/certificate/**", "/api/assessment/**", "/api/ai/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((request, response, exception) -> writeError(response, 401, "Sign in to continue."))
                .accessDeniedHandler((request, response, exception) -> writeError(response, 403, "Request could not be verified. Refresh and try again."))
            )
            .addFilterBefore(httpsFilter, HeaderWriterFilter.class)
            .addFilterAfter(securityHeadersFilter, HttpsEnforcementFilter.class)
            .addFilterAfter(payloadSizeFilter, SecurityHeadersFilter.class)
            .addFilterAfter(originFilter, PayloadSizeFilter.class)
            .addFilterBefore(sessionFilter, AnonymousAuthenticationFilter.class)
            .addFilterAfter(csrfCookieFilter, CsrfFilter.class);

        return http.build();
    }

    private static void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
