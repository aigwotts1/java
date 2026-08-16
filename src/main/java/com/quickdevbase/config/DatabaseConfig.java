package com.quickdevbase.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class DatabaseConfig {
    @Bean
    DataSource dataSource(Environment environment) {
        String rawUrl = firstNonBlank(
            environment.getProperty("DATABASE_URL"),
            environment.getProperty("SPRING_DATASOURCE_URL")
        );
        if (rawUrl == null) {
            throw new IllegalStateException("DATABASE_URL is required. Copy .env.example or use docker compose.");
        }

        DatabaseConnection connection = parse(rawUrl);
        String jdbcUrl = applySslOptions(connection.jdbcUrl(), environment);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(firstNonBlank(environment.getProperty("SPRING_DATASOURCE_USERNAME"), connection.username()));
        config.setPassword(firstNonBlank(environment.getProperty("SPRING_DATASOURCE_PASSWORD"), connection.password()));
        config.setMaximumPoolSize(environment.getProperty("DB_POOL_SIZE", Integer.class, 10));
        config.setMinimumIdle(1);
        config.setIdleTimeout(30_000);
        config.setPoolName("quickdevbase-db");
        return new HikariDataSource(config);
    }

    static DatabaseConnection parse(String rawUrl) {
        if (rawUrl.startsWith("jdbc:postgresql:")) {
            return new DatabaseConnection(rawUrl, null, null);
        }
        if (!rawUrl.matches("^postgres(?:ql)?://.+")) {
            throw new IllegalArgumentException("DATABASE_URL must be a PostgreSQL URI or JDBC URL.");
        }

        URI uri = URI.create(rawUrl.replaceFirst("^postgres(?:ql)?://", "http://"));
        String userInfo = uri.getRawUserInfo();
        String username = null;
        String password = null;
        if (userInfo != null) {
            String[] credentials = userInfo.split(":", 2);
            username = decode(credentials[0]);
            password = credentials.length > 1 ? decode(credentials[1]) : "";
        }
        int port = uri.getPort() < 0 ? 5432 : uri.getPort();
        String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getRawPath() + query;
        return new DatabaseConnection(jdbcUrl, username, password);
    }

    private static String applySslOptions(String jdbcUrl, Environment environment) {
        if (!environment.getProperty("DB_SSL", Boolean.class, false) || jdbcUrl.matches(".*[?&]sslmode=.*")) {
            return jdbcUrl;
        }
        String mode = environment.getProperty("DB_SSL_MODE");
        if (mode == null || mode.isBlank()) {
            mode = environment.getProperty("DB_SSL_REJECT_UNAUTHORIZED", Boolean.class, true) ? "verify-full" : "require";
        }
        return jdbcUrl + (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=" + mode;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    record DatabaseConnection(String jdbcUrl, String username, String password) {}
}
