package com.quickdevbase.web;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.quickdevbase.assessment.AssessmentService;
import com.quickdevbase.assessment.AssessmentService.AssessmentStatus;
import com.quickdevbase.assessment.AssessmentService.AttemptResult;
import com.quickdevbase.assessment.AssessmentService.AttemptView;
import com.quickdevbase.assessment.AssessmentService.SavedAnswer;
import com.quickdevbase.assessment.AssessmentService.SubmittedAnswer;
import com.quickdevbase.assessment.AssessmentService.ViolationResult;
import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.course.CourseCatalog.Course;
import com.quickdevbase.security.RateLimitService;
import com.quickdevbase.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AssessmentController {
    private final CourseCatalog courses;
    private final AssessmentService assessments;
    private final RateLimitService limits;

    public AssessmentController(CourseCatalog courses, AssessmentService assessments, RateLimitService limits) {
        this.courses = courses;
        this.assessments = assessments;
        this.limits = limits;
    }

    @GetMapping("/api/assessment")
    AssessmentStatus status(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String course
    ) {
        return assessments.status(principal.account().id(), selected(course));
    }

    @PostMapping("/api/assessment/start")
    AttemptView start(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) String course
    ) {
        checkLimit(principal);
        return assessments.start(principal.account().id(), selected(course));
    }

    @PutMapping("/api/assessment/attempts/{attemptId}/answers/{position}")
    SavedAnswer answer(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID attemptId,
        @PathVariable int position,
        @RequestParam(required = false) String course,
        @RequestBody AnswerRequest body
    ) {
        checkLimit(principal);
        if (body == null || body.selectedOption() == null) {
            throw new ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Choose an answer.");
        }
        return assessments.saveAnswer(attemptId, principal.account().id(), selected(course), position, body.selectedOption());
    }

    @PostMapping("/api/assessment/attempts/{attemptId}/submit")
    AttemptResult submit(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID attemptId,
        @RequestParam(required = false) String course,
        @RequestBody(required = false) SubmitRequest body
    ) {
        checkLimit(principal);
        List<SubmittedAnswer> answers = body == null || body.answers() == null ? List.of() : body.answers();
        return assessments.submit(attemptId, principal.account().id(), selected(course), answers);
    }

    @PostMapping("/api/assessment/attempts/{attemptId}/violation")
    ViolationResult violation(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID attemptId,
        @RequestParam(required = false) String course,
        @RequestBody Map<String, String> body
    ) {
        checkLimit(principal);
        return assessments.recordViolation(
            attemptId, principal.account().id(), selected(course), body == null ? "" : body.getOrDefault("type", "")
        );
    }

    private Course selected(String course) {
        return courses.byKey(course).orElseThrow(() -> new ApiException(
            org.springframework.http.HttpStatus.BAD_REQUEST, "Unknown assessment course."
        ));
    }

    private void checkLimit(UserPrincipal principal) {
        limits.check("assessment:" + principal.account().id(), 120, Duration.ofMinutes(1));
    }

    public record AnswerRequest(Integer selectedOption) {}
    public record SubmitRequest(List<SubmittedAnswer> answers) {}
}
