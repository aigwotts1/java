package com.quickdevbase.ai;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

import com.quickdevbase.ai.KnowledgeCatalog.KnowledgeMatch;
import com.quickdevbase.security.RateLimitService;
import com.quickdevbase.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiDiscoveryService {
    static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;

    private final AiSettings settings;
    private final GeminiClient gemini;
    private final AiUsageService usage;
    private final RateLimitService rateLimits;
    private final KnowledgeCatalog catalog;

    public AiDiscoveryService(
        AiSettings settings,
        GeminiClient gemini,
        AiUsageService usage,
        RateLimitService rateLimits,
        KnowledgeCatalog catalog
    ) {
        this.settings = settings;
        this.gemini = gemini;
        this.usage = usage;
        this.rateLimits = rateLimits;
        this.catalog = catalog;
    }

    public DiscoveryResponse discover(UUID userId, MultipartFile image, String rawQuestion) {
        String question = normalizeQuestion(rawQuestion);
        boolean hasImage = image != null && !image.isEmpty();
        if (!hasImage && question.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Upload an image or enter a topic to search.");
        }

        rateLimits.check("ai:discover:minute:" + userId, settings.minuteLimit(), Duration.ofMinutes(1));
        String extractedText = "";
        String model = null;
        int remainingToday = usage.remaining(userId, settings.dailyLimit());

        if (hasImage) {
            if (!settings.enabled()) {
                throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Image matching is not configured yet. Add GEMINI_API_KEY on the server or search by text.");
            }
            byte[] bytes = readAndValidate(image);
            String mediaType = detectedMediaType(bytes);
            int count = usage.consume(userId, settings.dailyLimit(), settings.globalDailyLimit());
            GeminiClient.GeminiAnswer extraction = gemini.extractEducationalText(bytes, mediaType);
            extractedText = normalizeExtraction(extraction.answer());
            model = settings.model();
            remainingToday = Math.max(0, settings.dailyLimit() - count);
        }

        String retrievalQuery = (question + "\n" + extractedText).trim();
        List<KnowledgeMatch> matches = catalog.search(retrievalQuery, 3);
        String detectedTopic = matches.isEmpty() ? null : matches.get(0).matchedConcepts().get(0);
        String answer = responseText(hasImage, matches);
        return new DiscoveryResponse(
            detectedTopic,
            answer,
            matches,
            hasImage,
            model,
            remainingToday,
            "Uploaded images are analyzed for this request and are not retained by QuickDevBase after processing."
        );
    }

    private static String normalizeQuestion(String value) {
        String question = value == null ? "" : value.trim().replace("\u0000", "");
        if (question.length() > 500) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Keep your question under 500 characters.");
        }
        return question;
    }

    private static String normalizeExtraction(String value) {
        String text = value == null ? "" : value.trim().replace("\u0000", "");
        if (text.equalsIgnoreCase("NO_RELEVANT_TEXT")) return "";
        return text.length() > 12_000 ? text.substring(0, 12_000) : text;
    }

    private static byte[] readAndValidate(MultipartFile image) {
        if (image.getSize() > MAX_IMAGE_BYTES) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Choose an image smaller than 5 MB.");
        }
        try {
            byte[] bytes = image.getBytes();
            if (bytes.length == 0) throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a non-empty image.");
            return bytes;
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The uploaded image could not be read.");
        }
    }

    private static String detectedMediaType(byte[] bytes) {
        if (bytes.length >= 8
            && (bytes[0] & 0xff) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4e && bytes[3] == 0x47
            && bytes[4] == 0x0d && bytes[5] == 0x0a && bytes[6] == 0x1a && bytes[7] == 0x0a) {
            return "image/png";
        }
        if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff) {
            return "image/jpeg";
        }
        if (bytes.length >= 12
            && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
            && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "image/webp";
        }
        throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Upload a PNG, JPEG, or WebP image.");
    }

    private static String responseText(boolean usedImage, List<KnowledgeMatch> matches) {
        if (matches.isEmpty()) {
            return "I could not confidently match that to the current course catalog. Try a clearer crop or include the language, tool, API, or concept name.";
        }
        KnowledgeMatch match = matches.get(0);
        String input = usedImage ? "your image" : "your question";
        return "I matched " + input + " to \"" + match.moduleTitle() + "\". QuickDevBase explains "
            + match.matchedConcepts().get(0) + " this way: " + match.explanation();
    }

    public record DiscoveryResponse(
        String detectedTopic,
        String answer,
        List<KnowledgeMatch> matches,
        boolean usedImage,
        String model,
        int remainingToday,
        String privacyNote
    ) {}
}
