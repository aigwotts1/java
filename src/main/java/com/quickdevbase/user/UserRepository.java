package com.quickdevbase.user;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public UserAccount create(UUID id, String name, String email, String passwordHash) {
        return jdbc.queryForObject(
            "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?) RETURNING id, name, email, password_hash, created_at",
            this::map,
            id, name, email, passwordHash
        );
    }

    public Optional<UserAccount> findByEmail(String email) {
        return jdbc.query(
            "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?",
            this::map,
            email
        ).stream().findFirst();
    }

    public Optional<UserAccount> findById(UUID id) {
        return jdbc.query(
            "SELECT id, name, email, password_hash, created_at FROM users WHERE id = ?",
            this::map,
            id
        ).stream().findFirst();
    }

    public UserAccount rename(UUID id, String name) {
        return jdbc.queryForObject(
            "UPDATE users SET name = ? WHERE id = ? RETURNING id, name, email, password_hash, created_at",
            this::map,
            name, id
        );
    }

    public void updatePasswordHash(UUID id, String passwordHash) {
        jdbc.update("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, id);
    }

    public void delete(UUID id) {
        jdbc.update("DELETE FROM users WHERE id = ?", id);
    }

    private UserAccount map(ResultSet row, int rowNumber) throws SQLException {
        return new UserAccount(
            row.getObject("id", UUID.class),
            row.getString("name"),
            row.getString("email"),
            row.getString("password_hash"),
            row.getObject("created_at", OffsetDateTime.class)
        );
    }
}
