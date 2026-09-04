package com.quickdevbase.web;

import java.time.Duration;
import java.util.Map;
import java.util.regex.Pattern;

import com.quickdevbase.certificate.CertificatePresentationService;
import com.quickdevbase.certificate.CertificatePresentationService.CertificatePayload;
import com.quickdevbase.certificate.CertificateRecord;
import com.quickdevbase.certificate.CertificateService;
import com.quickdevbase.config.AppSettings;
import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.course.CourseCatalog.Course;
import com.quickdevbase.security.RateLimitService;
import com.quickdevbase.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CertificateController {
    private static final Pattern PUBLIC_ID = Pattern.compile("^[A-Za-z0-9_-]{20,32}$");
    private static final Pattern HASH = Pattern.compile("^[a-f0-9]{64}$");

    private final CourseCatalog courses;
    private final CertificateService certificates;
    private final CertificatePresentationService presentation;
    private final RateLimitService limits;

    public CertificateController(
        CourseCatalog courses,
        CertificateService certificates,
        CertificatePresentationService presentation,
        RateLimitService limits
    ) {
        this.courses = courses;
        this.certificates = certificates;
        this.presentation = presentation;
        this.limits = limits;
    }

    @GetMapping("/api/certificate")
    CertificateStatusResponse status(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String course,
        HttpServletRequest request
    ) {
        Course selected = courses.byKeyOrJava(course);
        CertificateService.CertificateStatus status = certificates.status(principal.account().id(), selected);
        return new CertificateStatusResponse(
            presentation.payload(status.certificate(), request),
            selected.key(),
            status.eligible(),
            status.completedCount(),
            selected.moduleCount(),
            status.modulesComplete(),
            status.assessmentPassed(),
            status.assessmentAttemptsUsed(),
            status.assessmentAttemptsRemaining(),
            "/assessment?course=" + selected.key(),
            AppSettings.CONSENT_VERSION
        );
    }

    @PostMapping("/api/certificate/claim")
    ResponseEntity<?> claim(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String course,
        @RequestBody(required = false) ClaimRequest body,
        HttpServletRequest request
    ) {
        if (body == null || !Boolean.TRUE.equals(body.consent()) || !AppSettings.CONSENT_VERSION.equals(body.consentVersion())) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Review and accept the current public certificate notice before publishing.",
                "consentVersion", AppSettings.CONSENT_VERSION
            ));
        }
        Course selected = courses.byKeyOrJava(course);
        CertificateService.ClaimResult result = certificates.claim(principal.account(), selected, body.publicName());
        if (!result.eligible()) {
            String error = result.completedCount() < selected.moduleCount()
                ? "Complete all " + selected.moduleCount() + " modules before claiming your certificate."
                : "Pass the certificate assessment before claiming your certificate.";
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", error,
                "completedCount", result.completedCount(),
                "requiredCount", selected.moduleCount(),
                "assessmentPassed", result.assessmentPassed()
            ));
        }
        ClaimResponse response = new ClaimResponse(
            presentation.payload(result.certificate(), request),
            result.user().publicView(),
            result.newlyIssued(),
            result.newlyPublished()
        );
        return ResponseEntity.status(result.newlyIssued() ? HttpStatus.CREATED : HttpStatus.OK).body(response);
    }

    @DeleteMapping("/api/certificate/publication")
    Map<String, CertificatePayload> unpublish(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String course,
        HttpServletRequest request
    ) {
        Course selected = courses.byKeyOrJava(course);
        CertificateRecord certificate = certificates.unpublish(principal.account().id(), selected)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Certificate not found."));
        return Map.of("certificate", presentation.payload(certificate, request));
    }

    @GetMapping("/api/certificates/{publicId}")
    VerificationResponse verifyPublicId(@PathVariable String publicId, HttpServletRequest request) {
        checkVerificationLimit(request);
        if (!PUBLIC_ID.matcher(publicId).matches()) throw notFound();
        CertificateRecord certificate = certificates.findPublicById(publicId).orElseThrow(this::notFound);
        return new VerificationResponse(presentation.payload(certificate, request), true);
    }

    @GetMapping("/api/certificates/verify/{hash}")
    VerificationResponse verifyHash(@PathVariable String hash, HttpServletRequest request) {
        checkVerificationLimit(request);
        if (!HASH.matcher(hash).matches()) throw notFound();
        CertificateRecord certificate = certificates.findPublicByHash(hash).orElseThrow(this::notFound);
        return new VerificationResponse(presentation.payload(certificate, request), true);
    }

    private void checkVerificationLimit(HttpServletRequest request) {
        limits.check("verify:" + request.getRemoteAddr(), 120, Duration.ofMinutes(1));
    }

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Certificate not found.");
    }

    public record CertificateStatusResponse(
        CertificatePayload certificate,
        String course,
        boolean eligible,
        int completedCount,
        int requiredCount,
        boolean modulesComplete,
        boolean assessmentPassed,
        int assessmentAttemptsUsed,
        int assessmentAttemptsRemaining,
        String assessmentUrl,
        String consentVersion
    ) {}

    public record ClaimRequest(Boolean consent, String consentVersion, String publicName) {}
    public record ClaimResponse(CertificatePayload certificate, com.quickdevbase.user.UserAccount.PublicUser user, boolean newlyIssued, boolean newlyPublished) {}
    public record VerificationResponse(CertificatePayload certificate, boolean verified) {}
}
