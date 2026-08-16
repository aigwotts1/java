package com.quickdevbase.certificate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import com.quickdevbase.config.AppSettings;
import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.course.CourseCatalog.Course;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

@Service
public class CertificatePresentationService {
    private final CourseCatalog courses;
    private final AppSettings settings;

    public CertificatePresentationService(CourseCatalog courses, AppSettings settings) {
        this.courses = courses;
        this.settings = settings;
    }

    public CertificatePayload payload(CertificateRecord certificate, HttpServletRequest request) {
        if (certificate == null) return null;
        Course course = courses.byCode(certificate.courseCode()).orElseGet(() -> courses.byKeyOrJava("java"));
        String shareUrl = origin(request) + "/certificate/" + certificate.publicId();
        return new CertificatePayload(
            "QDB-" + course.key().substring(0, Math.min(3, course.key().length())).toUpperCase() + "-"
                + certificate.publicId().substring(0, Math.min(10, certificate.publicId().length())).toUpperCase(),
            certificate.publicId(),
            certificate.verificationHash(),
            certificate.userName(),
            certificate.courseCode(),
            course.key(),
            course.title(),
            course.path(),
            certificate.issuedAt(),
            certificate.isPublic(),
            certificate.publishedAt(),
            certificate.unpublishedAt(),
            course.moduleCount(),
            course.conceptCount(),
            shareUrl,
            "https://www.linkedin.com/sharing/share-offsite/?url=" + URLEncoder.encode(shareUrl, StandardCharsets.UTF_8)
        );
    }

    public String origin(HttpServletRequest request) {
        if (!settings.publicAppUrl().isBlank()) return settings.publicAppUrl();
        if (!settings.configuredOrigin().isBlank()) return settings.configuredOrigin();
        boolean defaultPort = (request.isSecure() && request.getServerPort() == 443)
            || (!request.isSecure() && request.getServerPort() == 80);
        return request.getScheme() + "://" + request.getServerName() + (defaultPort ? "" : ":" + request.getServerPort());
    }

    public record CertificatePayload(
        String credentialId,
        String publicId,
        String verificationHash,
        String name,
        String courseCode,
        String courseKey,
        String courseTitle,
        String coursePath,
        java.time.OffsetDateTime issuedAt,
        boolean isPublic,
        java.time.OffsetDateTime publishedAt,
        java.time.OffsetDateTime unpublishedAt,
        int moduleCount,
        int conceptCount,
        String shareUrl,
        String linkedInShareUrl
    ) {}
}
