package com.quickdevbase.web;

import java.util.List;

import com.quickdevbase.certificate.CertificatePresentationService;
import com.quickdevbase.certificate.CertificateService;
import com.quickdevbase.config.AppSettings;
import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.course.CourseCatalog.Course;
import com.quickdevbase.learning.LearningService;
import com.quickdevbase.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LearningController {
    private final CourseCatalog courses;
    private final LearningService learning;
    private final CertificateService certificates;
    private final CertificatePresentationService presentation;

    public LearningController(
        CourseCatalog courses,
        LearningService learning,
        CertificateService certificates,
        CertificatePresentationService presentation
    ) {
        this.courses = courses;
        this.learning = learning;
        this.certificates = certificates;
        this.presentation = presentation;
    }

    @GetMapping("/api/progress")
    ProgressResponse progress(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String course
    ) {
        Course selected = courses.byKeyOrJava(course);
        List<Integer> completed = learning.completedModules(principal.account().id(), selected);
        return new ProgressResponse(selected.key(), completed);
    }

    @PutMapping("/api/progress/{moduleId}")
    ProgressUpdateResponse update(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable int moduleId,
        @RequestParam(required = false) String course,
        @RequestBody(required = false) ProgressUpdate body,
        HttpServletRequest request
    ) {
        Course selected = courses.byKeyOrJava(course);
        if (moduleId < 1 || moduleId > selected.moduleCount()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown learning module.");
        }
        if (body == null || body.completed() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "completed must be true or false.");
        }

        int completedCount = learning.save(principal.account().id(), selected, moduleId, body.completed());
        CertificateService.CertificateStatus status = certificates.status(principal.account().id(), selected);
        return new ProgressUpdateResponse(
            moduleId,
            body.completed(),
            presentation.payload(status.certificate(), request),
            selected.key(),
            status.eligible(),
            completedCount,
            selected.moduleCount(),
            status.modulesComplete(),
            status.assessmentPassed(),
            status.assessmentAttemptsUsed(),
            status.assessmentAttemptsRemaining(),
            "/assessment?course=" + selected.key(),
            AppSettings.CONSENT_VERSION
        );
    }

    public record ProgressResponse(String course, List<Integer> completed) {}
    public record ProgressUpdate(Boolean completed) {}
    public record ProgressUpdateResponse(
        int moduleId,
        boolean completed,
        CertificatePresentationService.CertificatePayload certificate,
        String course,
        boolean certificateEligible,
        int completedCount,
        int requiredCount,
        boolean modulesComplete,
        boolean assessmentPassed,
        int assessmentAttemptsUsed,
        int assessmentAttemptsRemaining,
        String assessmentUrl,
        String consentVersion
    ) {}
}
