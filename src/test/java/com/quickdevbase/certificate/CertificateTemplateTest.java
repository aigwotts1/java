package com.quickdevbase.certificate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

import com.quickdevbase.certificate.CertificatePresentationService.CertificatePayload;
import com.quickdevbase.course.CourseCatalog;
import org.junit.jupiter.api.Test;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templatemode.TemplateMode;

class CertificateTemplateTest {
    @Test
    void escapesPublicNamesAndIncludesVerificationMetadata() {
        CourseCatalog.Course course = new CourseCatalog().byKeyOrJava("java");
        String publicName = "Ada <script>alert(1)</script>";
        CertificatePayload certificate = new CertificatePayload(
            "QDB-JAV-ABCDEFGHIJ",
            "aBcDeFgHiJkLmNoPqRsTuVwX",
            "a".repeat(64),
            publicName,
            course.code(),
            course.key(),
            course.title(),
            course.path(),
            OffsetDateTime.of(2026, 8, 14, 10, 30, 0, 0, ZoneOffset.UTC),
            true,
            OffsetDateTime.of(2026, 8, 14, 10, 31, 0, 0, ZoneOffset.UTC),
            null,
            course.moduleCount(),
            course.conceptCount(),
            "https://learn.example.com/certificate/aBcDeFgHiJkLmNoPqRsTuVwX",
            "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Flearn.example.com"
        );

        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        SpringTemplateEngine templates = new SpringTemplateEngine();
        templates.setTemplateResolver(resolver);

        Context context = new Context(Locale.US);
        context.setVariable("certificate", certificate);
        context.setVariable("course", course);
        context.setVariable("issuedDate", "14 August 2026");
        context.setVariable("pageTitle", publicName + " — " + course.title());
        context.setVariable("description", "Completion record");
        String html = templates.process("certificate", context);

        assertTrue(html.contains("Ada &lt;script&gt;alert(1)&lt;/script&gt;"));
        assertFalse(html.contains("<script>alert(1)</script>"));
        assertTrue(html.contains(certificate.verificationHash()));
        assertTrue(html.contains("noindex, nofollow"));
        assertTrue(html.contains("not a professional licence"));
        assertTrue(html.contains("Verified by QuickDevBase.in"));
        assertTrue(html.contains("reviewing every topic"));
        assertFalse(html.contains("class=\"certificate-mark\""));
        assertFalse(html.contains("class=\"seal\""));
    }
}
