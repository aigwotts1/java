package com.quickdevbase.ai;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

import com.quickdevbase.ai.AiPromptFactory.AiQuestion;
import com.quickdevbase.ai.AiPromptFactory.Mode;
import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.course.CourseCatalog.Course;
import com.quickdevbase.security.RateLimitService;
import com.quickdevbase.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AiGuideService {
    private final AiSettings settings;
    private final CourseCatalog courses;
    private final AiPromptFactory prompts;
    private final GeminiClient gemini;
    private final AiUsageService usage;
    private final RateLimitService rateLimits;
    private final KnowledgeVectorStore vectors;
    private final KnowledgeCatalog knowledge;

    public AiGuideService(
        AiSettings settings,
        CourseCatalog courses,
        AiPromptFactory prompts,
        GeminiClient gemini,
        AiUsageService usage,
        RateLimitService rateLimits,
        KnowledgeVectorStore vectors,
        KnowledgeCatalog knowledge
    ) {
        this.settings = settings;
        this.courses = courses;
        this.prompts = prompts;
        this.gemini = gemini;
        this.usage = usage;
        this.rateLimits = rateLimits;
        this.vectors = vectors;
        this.knowledge = knowledge;
    }

    public Status status(UUID userId) {
        return new Status(
            settings.enabled(),
            settings.enabled() ? settings.model() : null,
            settings.dailyLimit(),
            usage.remaining(userId, settings.dailyLimit()),
            settings.ragEnabled(),
            settings.ragEnabled() ? settings.embeddingModel() : null,
            settings.ragEnabled() ? vectors.indexedCount(settings.embeddingModel()) : 0,
            knowledge.conceptCount()
        );
    }

    public Answer ask(UUID userId, Request input) {
        if (!settings.enabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "Ask QuickDev is not configured yet. Add GEMINI_API_KEY on the server to enable it.");
        }
        Request request = input == null ? new Request(null, null, null, null, null, null, null) : input;
        Course course = courses.byKey(request.course())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Choose a valid course."));
        int moduleId = request.moduleId() == null ? 0 : request.moduleId();
        if (moduleId < 1 || moduleId > course.moduleCount()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a valid learning module.");
        }

        String title = required(request.moduleTitle(), 2, 120, "Module title is missing.");
        String context = required(request.context(), 20, 16_000, "Lesson context is missing or too long.");
        String officialUrl = required(request.officialUrl(), 10, 500, "Official documentation link is missing.");
        if (!officialUrl.matches("https://[^\\s]+")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Official documentation must use HTTPS.");
        }

        Mode mode;
        try {
            mode = Mode.parse(request.mode());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
        String question = request.question() == null ? "" : request.question().trim();
        if (mode == Mode.ASK && (question.length() < 2 || question.length() > 500)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Enter a question between 2 and 500 characters.");
        }
        if (mode != Mode.ASK) question = "";

        rateLimits.check("ai:minute:" + userId, settings.minuteLimit(), Duration.ofMinutes(1));
        AiQuestion validated = new AiQuestion(moduleId, title, mode, question, context, officialUrl);
        String prompt = prompts.userPrompt(course, validated);
        String cacheKey = hash(settings.model() + "\n" + AiPromptFactory.SYSTEM_PROMPT + "\n" + prompt);
        var cached = usage.cached(cacheKey);
        if (cached.isPresent()) {
            var answer = cached.get();
            return new Answer(answer.answer(), settings.model(), usage.remaining(userId, settings.dailyLimit()), true,
                answer.inputTokens(), answer.outputTokens());
        }

        int count = usage.consume(userId, settings.dailyLimit(), settings.globalDailyLimit());
        GeminiClient.GeminiAnswer generated = gemini.generate(AiPromptFactory.SYSTEM_PROMPT, prompt);
        usage.cache(cacheKey, settings.model(), generated, settings.cacheDays());
        return new Answer(generated.answer(), settings.model(), Math.max(0, settings.dailyLimit() - count), false,
            generated.inputTokens(), generated.outputTokens());
    }

    private static String required(String value, int minimum, int maximum, String message) {
        String normalized = value == null ? "" : value.trim().replace("\u0000", "");
        if (normalized.length() < minimum || normalized.length() > maximum) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return normalized;
    }

    private static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    public record Request(
        String course,
        Integer moduleId,
        String moduleTitle,
        String mode,
        String question,
        String context,
        String officialUrl
    ) {}
    public record Status(
        boolean enabled,
        String model,
        int dailyLimit,
        int remainingToday,
        boolean ragEnabled,
        String embeddingModel,
        int indexedChunks,
        int totalChunks
    ) {}
    public record Answer(
        String answer,
        String model,
        int remainingToday,
        boolean cached,
        int inputTokens,
        int outputTokens
    ) {}
}
