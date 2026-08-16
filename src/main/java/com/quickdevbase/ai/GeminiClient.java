package com.quickdevbase.ai;

import java.net.http.HttpClient;
import java.util.List;
import java.util.Map;

import com.quickdevbase.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class GeminiClient {
    private final AiSettings settings;
    private final RestClient client;

    public GeminiClient(AiSettings settings) {
        this.settings = settings;
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(settings.timeout()).build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(settings.timeout());
        this.client = RestClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com")
            .requestFactory(requestFactory)
            .build();
    }

    GeminiAnswer generate(String systemPrompt, String userPrompt) {
        Map<String, Object> body = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
            "contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userPrompt))
            )),
            "store", false,
            "generationConfig", Map.of(
                "maxOutputTokens", settings.maxOutputTokens(),
                "temperature", 0.3
            )
        );

        try {
            GeminiResponse response = client.post()
                .uri("/v1beta/models/{model}:generateContent", settings.model())
                .header("x-goog-api-key", settings.apiKey())
                .body(body)
                .retrieve()
                .body(GeminiResponse.class);
            return extract(response);
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 429) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "The AI guide has reached its provider quota. Please try again later.");
            }
            if (exception.getStatusCode().is4xxClientError()) {
                throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI guide is not configured correctly yet.");
            }
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "The AI guide is temporarily unavailable. Please try again shortly.");
        } catch (ResourceAccessException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "The AI guide took too long to respond. Please try again.");
        }
    }

    private static GeminiAnswer extract(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                "The AI guide could not produce an answer for that request.");
        }
        String answer = response.candidates().stream()
            .filter(candidate -> candidate.content() != null && candidate.content().parts() != null)
            .flatMap(candidate -> candidate.content().parts().stream())
            .map(Part::text)
            .filter(text -> text != null && !text.isBlank())
            .reduce("", (left, right) -> left.isBlank() ? right : left + "\n" + right)
            .trim();
        if (answer.isBlank() || answer.length() > 12_000) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                "The AI guide could not produce a usable answer for that request.");
        }
        Usage usage = response.usageMetadata();
        return new GeminiAnswer(
            answer,
            usage == null || usage.promptTokenCount() == null ? 0 : usage.promptTokenCount(),
            usage == null || usage.candidatesTokenCount() == null ? 0 : usage.candidatesTokenCount()
        );
    }

    record GeminiAnswer(String answer, int inputTokens, int outputTokens) {}
    record GeminiResponse(List<Candidate> candidates, Usage usageMetadata) {}
    record Candidate(Content content) {}
    record Content(List<Part> parts) {}
    record Part(String text) {}
    record Usage(Integer promptTokenCount, Integer candidatesTokenCount, Integer totalTokenCount) {}
}
