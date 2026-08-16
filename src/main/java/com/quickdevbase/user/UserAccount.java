package com.quickdevbase.user;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserAccount(UUID id, String name, String email, String passwordHash, OffsetDateTime createdAt) {
    public PublicUser publicView() {
        return new PublicUser(id, name, email, createdAt);
    }

    public record PublicUser(UUID id, String name, String email, OffsetDateTime createdAt) {}
}
