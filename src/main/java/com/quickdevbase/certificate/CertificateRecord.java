package com.quickdevbase.certificate;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CertificateRecord(
    UUID id,
    String publicId,
    String verificationHash,
    UUID userId,
    String userName,
    String courseCode,
    OffsetDateTime issuedAt,
    boolean isPublic,
    OffsetDateTime publishedAt,
    OffsetDateTime unpublishedAt
) {}
