package com.quickdevbase.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class DatabaseConfigTest {
    @Test
    void convertsProviderPostgresUriToJdbcConfiguration() {
        DatabaseConfig.DatabaseConnection connection = DatabaseConfig.parse(
            "postgresql://quick%40dev:p%40ss%3Aword@db.example.com:5433/knowledge?sslmode=require"
        );

        assertEquals("jdbc:postgresql://db.example.com:5433/knowledge?sslmode=require", connection.jdbcUrl());
        assertEquals("quick@dev", connection.username());
        assertEquals("p@ss:word", connection.password());
    }

    @Test
    void acceptsJdbcUrlWithoutRewritingIt() {
        DatabaseConfig.DatabaseConnection connection = DatabaseConfig.parse("jdbc:postgresql://localhost:5432/java_basecamp");
        assertEquals("jdbc:postgresql://localhost:5432/java_basecamp", connection.jdbcUrl());
    }
}
