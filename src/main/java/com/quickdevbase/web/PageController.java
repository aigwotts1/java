package com.quickdevbase.web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import com.quickdevbase.certificate.CertificatePresentationService;
import com.quickdevbase.certificate.CertificatePresentationService.CertificatePayload;
import com.quickdevbase.certificate.CertificateRecord;
import com.quickdevbase.certificate.CertificateService;
import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.course.CourseCatalog.Course;
import com.quickdevbase.security.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Controller
public class PageController {
    private static final DateTimeFormatter CERTIFICATE_DATE = DateTimeFormatter
        .ofPattern("dd MMMM uuuu", Locale.US)
        .withZone(ZoneOffset.UTC);

    private final String home;
    private final String team;
    private final String portal;
    private final String aiHub;
    private final String privacy;
    private final String terms;
    private final String certificatePolicy;
    private final String javaCourseData;
    private final CourseCatalog courses;
    private final CertificateService certificates;
    private final CertificatePresentationService presentation;
    private final RateLimitService limits;
    private final TemplateEngine templates;

    public PageController(
        CourseCatalog courses,
        CertificateService certificates,
        CertificatePresentationService presentation,
        RateLimitService limits,
        TemplateEngine templates
    ) throws IOException {
        this.home = read("home.html");
        this.team = read("team.html");
        this.portal = read("index.html");
        this.aiHub = read("ai.html");
        this.privacy = read("privacy.html");
        this.terms = read("terms.html");
        this.certificatePolicy = read("certificate-policy.html");
        this.javaCourseData = "window.QUICKDEV_COURSE = " + readResource("curriculum/java.json") + ";\n";
        this.courses = courses;
        this.certificates = certificates;
        this.presentation = presentation;
        this.limits = limits;
        this.templates = templates;
    }

    @GetMapping("/")
    ResponseEntity<String> home() {
        return html(home);
    }

    @GetMapping("/team")
    ResponseEntity<String> team() {
        return html(team);
    }

    @GetMapping("/java")
    ResponseEntity<String> java() {
        return html(withDataScript(portal, "/java-data.js", false));
    }

    @GetMapping(value = "/java-data.js", produces = "text/javascript;charset=UTF-8")
    ResponseEntity<String> javaData() {
        return ResponseEntity.ok().contentType(MediaType.valueOf("text/javascript;charset=UTF-8")).body(javaCourseData);
    }

    @GetMapping("/docker")
    ResponseEntity<String> docker() {
        return html(withDataScript(portal, "/docker-data.js", false));
    }

    @GetMapping("/python")
    ResponseEntity<String> python() {
        return html(withDataScript(portal, "/python-data.js", false));
    }

    @GetMapping("/sql")
    ResponseEntity<String> sql() {
        return html(withDataScript(portal, "/sql-data.js", false));
    }

    @GetMapping("/ai")
    ResponseEntity<String> ai() {
        return html(aiHub);
    }

    @GetMapping({"/ai/generative-ai", "/ai/rag", "/ai/agents"})
    ResponseEntity<String> aiPath() {
        String nested = portal.replace("href=\"styles.css\"", "href=\"/styles.css\"");
        return html(withDataScript(nested, "/ai-data.js", true));
    }

    @GetMapping("/privacy")
    ResponseEntity<String> privacy() {
        return html(privacy);
    }

    @GetMapping("/terms")
    ResponseEntity<String> terms() {
        return html(terms);
    }

    @GetMapping("/certificate-policy")
    ResponseEntity<String> certificatePolicy() {
        return html(certificatePolicy);
    }

    @GetMapping("/certificate/{publicId}")
    ResponseEntity<String> publicCertificate(@PathVariable String publicId, HttpServletRequest request) {
        limits.check("verify:" + request.getRemoteAddr(), 120, Duration.ofMinutes(1));
        if (!publicId.matches("^[A-Za-z0-9_-]{20,32}$")) return certificateNotFound();
        CertificateRecord record = certificates.findPublicById(publicId).orElse(null);
        if (record == null) return certificateNotFound();

        CertificatePayload certificate = presentation.payload(record, request);
        Course course = courses.byCode(record.courseCode()).orElseGet(() -> courses.byKeyOrJava("java"));
        Context context = new Context(Locale.US);
        context.setVariable("certificate", certificate);
        context.setVariable("course", course);
        context.setVariable("issuedDate", CERTIFICATE_DATE.format(record.issuedAt()));
        context.setVariable("pageTitle", certificate.name() + " — " + certificate.courseTitle());
        context.setVariable("description", certificate.name() + " reviewed all " + certificate.moduleCount() + " "
            + course.shortTitle() + " modules and " + certificate.conceptCount() + " concepts on QuickDevBase.in.");
        return html(templates.process("certificate", context));
    }

    private static String withDataScript(String source, String dataScript, boolean absoluteAppScript) {
        String appScript = absoluteAppScript ? "/app.js?v=20260825-discovery" : "app.js?v=20260825-discovery";
        return source.replace(
            "<script src=\"app.js?v=20260825-discovery\"></script>",
            "<script src=\"" + dataScript + "\"></script><script src=\"" + appScript + "\"></script>"
        );
    }

    private static String read(String filename) throws IOException {
        return readResource("static/" + filename);
    }

    private static String readResource(String filename) throws IOException {
        return new ClassPathResource(filename).getContentAsString(StandardCharsets.UTF_8);
    }

    private static ResponseEntity<String> html(String content) {
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(content);
    }

    private static ResponseEntity<String> certificateNotFound() {
        return ResponseEntity.status(404).contentType(MediaType.TEXT_PLAIN).body("Certificate not found.");
    }
}
