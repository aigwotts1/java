package com.quickdevbase.ai;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import com.quickdevbase.course.CourseCatalog;
import com.quickdevbase.course.CourseCatalog.Course;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class KnowledgeCatalog {
    private static final Pattern NON_WORD = Pattern.compile("[^a-z0-9+#.]+");
    private static final Set<String> STOP_WORDS = Set.of(
        "a", "an", "and", "are", "as", "at", "be", "by", "can", "class", "code", "do", "does", "for",
        "from", "how", "i", "if", "in", "into", "is", "it", "of", "on", "or", "program", "that", "the",
        "this", "to", "use", "using", "what", "when", "where", "which", "with", "you", "your"
    );
    private static final List<CurriculumSource> SOURCES = List.of(
        new CurriculumSource("java", "curriculum/java.json", null),
        new CurriculumSource("docker", "curriculum/docker.json", null),
        new CurriculumSource("python", "curriculum/python.json", null),
        new CurriculumSource("sql", "curriculum/sql.json", null),
        new CurriculumSource("generative-ai", "curriculum/ai.json", "generative-ai"),
        new CurriculumSource("rag", "curriculum/ai.json", "rag"),
        new CurriculumSource("agentic-ai", "curriculum/ai.json", "agentic-ai")
    );

    private final List<ConceptEntry> concepts;

    public KnowledgeCatalog(ObjectMapper mapper, CourseCatalog courses) {
        this.concepts = load(mapper, courses);
    }

    public List<KnowledgeMatch> search(String rawQuery, int limit) {
        String query = normalize(rawQuery);
        if (query.isBlank()) return List.of();

        Set<String> queryTokens = usefulTokens(query);
        List<ScoredConcept> scored = concepts.stream()
            .map(concept -> new ScoredConcept(concept, score(query, queryTokens, concept)))
            .filter(candidate -> candidate.score() >= 4)
            .sorted(Comparator.comparingInt(ScoredConcept::score).reversed()
                .thenComparing(candidate -> candidate.concept().courseKey())
                .thenComparing(candidate -> candidate.concept().moduleId())
                .thenComparing(candidate -> candidate.concept().topic()))
            .limit(60)
            .toList();

        Map<String, ModuleMatches> modules = new LinkedHashMap<>();
        for (ScoredConcept candidate : scored) {
            ConceptEntry concept = candidate.concept();
            String moduleKey = concept.courseKey() + ":" + concept.moduleId();
            ModuleMatches group = modules.computeIfAbsent(moduleKey, ignored -> new ModuleMatches(concept));
            group.add(concept, candidate.score());
        }

        return modules.values().stream()
            .sorted(Comparator.comparingInt(ModuleMatches::score).reversed())
            .limit(Math.max(1, Math.min(limit, 5)))
            .map(ModuleMatches::response)
            .toList();
    }

    public int conceptCount() {
        return concepts.size();
    }

    private static int score(String query, Set<String> queryTokens, ConceptEntry concept) {
        String topic = normalize(concept.topic());
        String title = normalize(concept.moduleTitle());
        String description = normalize(concept.moduleDescription());
        String explanation = normalize(concept.explanation());
        Set<String> topicTokens = usefulTokens(topic);
        Set<String> titleTokens = usefulTokens(title);
        Set<String> detailTokens = usefulTokens(description + " " + explanation);
        int score = 0;

        if (containsPhrase(query, topic) && (topic.length() >= 4 || query.equals(topic))) score += 40;
        if (topic.contains(query) && query.length() >= 4) score += 28;
        if (query.contains(title) && title.length() >= 4) score += 18;

        for (String token : queryTokens) {
            if (topicTokens.contains(token)) score += 8;
            else if (titleTokens.contains(token)) score += 4;
            else if (detailTokens.contains(token)) score += 2;
            else if (token.length() >= 5 && startsWithToken(topicTokens, token)) score += 3;
        }

        long matchedTopicTokens = queryTokens.stream().filter(topicTokens::contains).count();
        if (!topicTokens.isEmpty() && matchedTopicTokens == topicTokens.size()) score += 10;
        if (score > 0 && mentionsCourse(query, concept.courseKey())) score += 12;
        return score;
    }

    private static boolean mentionsCourse(String query, String courseKey) {
        return switch (courseKey) {
            case "java" -> containsPhrase(query, "java");
            case "docker" -> containsPhrase(query, "docker");
            case "python" -> containsPhrase(query, "python");
            case "sql" -> containsPhrase(query, "sql");
            case "generative-ai" -> containsPhrase(query, "generative ai") || containsPhrase(query, "genai");
            case "rag" -> containsPhrase(query, "rag") || containsPhrase(query, "retrieval augmented generation");
            case "agentic-ai" -> containsPhrase(query, "agentic ai") || containsPhrase(query, "ai agent")
                || containsPhrase(query, "ai agents");
            default -> false;
        };
    }

    private static boolean containsPhrase(String value, String phrase) {
        return (" " + value + " ").contains(" " + phrase + " ");
    }

    private static boolean startsWithToken(Set<String> candidates, String queryToken) {
        String stem = queryToken.substring(0, Math.max(4, queryToken.length() - 2));
        return candidates.stream().anyMatch(candidate -> candidate.startsWith(stem) || queryToken.startsWith(candidate));
    }

    private static Set<String> usefulTokens(String value) {
        Set<String> tokens = new HashSet<>();
        for (String token : value.split("\\s+")) {
            if (token.length() >= 2 && !STOP_WORDS.contains(token)) tokens.add(token);
        }
        return tokens;
    }

    private static String normalize(String value) {
        if (value == null) return "";
        String ascii = Normalizer.normalize(value, Normalizer.Form.NFKD)
            .replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT);
        return NON_WORD.matcher(ascii).replaceAll(" ").trim().replaceAll("\\s+", " ");
    }

    private static List<ConceptEntry> load(ObjectMapper mapper, CourseCatalog courses) {
        List<ConceptEntry> loaded = new ArrayList<>();
        for (CurriculumSource source : SOURCES) {
            Course course = courses.byKey(source.courseKey())
                .orElseThrow(() -> new IllegalStateException("Unknown course " + source.courseKey() + "."));
            int before = loaded.size();
            loadCourse(mapper, source, course, loaded);
            int courseConcepts = loaded.size() - before;
            if (courseConcepts != course.conceptCount()) {
                throw new IllegalStateException(
                    "Expected " + course.conceptCount() + " " + course.key() + " concepts, found " + courseConcepts + "."
                );
            }
        }
        return List.copyOf(loaded);
    }

    private static void loadCourse(
        ObjectMapper mapper,
        CurriculumSource source,
        Course course,
        List<ConceptEntry> loaded
    ) {
        try (var input = new ClassPathResource(source.resource()).getInputStream()) {
            JsonNode root = mapper.readTree(input);
            JsonNode curriculum = source.nodeKey() == null ? root : root.path(source.nodeKey());
            if (curriculum.isMissingNode()) {
                throw new IllegalStateException("Missing curriculum node " + source.nodeKey() + ".");
            }

            Map<Integer, JsonNode> notes = new HashMap<>();
            curriculum.path("quickNotes").forEachEntry((key, value) -> notes.put(Integer.parseInt(key), value));
            String courseName = curriculum.path("name").asText(course.shortTitle());

            for (JsonNode module : curriculum.path("modules")) {
                int moduleId = module.path("id").asInt();
                JsonNode moduleNotes = notes.get(moduleId);
                JsonNode topics = module.path("topics");
                if (moduleNotes == null || moduleNotes.size() != topics.size()) {
                    throw new IllegalStateException(
                        course.key() + " module " + moduleId + " has inconsistent topic notes."
                    );
                }
                for (int index = 0; index < topics.size(); index++) {
                    loaded.add(new ConceptEntry(
                        course.key(),
                        courseName,
                        course.path(),
                        moduleId,
                        module.path("title").asText(),
                        module.path("description").asText(),
                        topics.get(index).asText(),
                        moduleNotes.get(index).get(0).asText(),
                        moduleNotes.get(index).size() > 1 ? moduleNotes.get(index).get(1).asText() : "",
                        module.path("officialUrl").asText(),
                        module.path("officialLabel").asText("Official documentation")
                    ));
                }
            }
        } catch (IOException | RuntimeException exception) {
            throw new IllegalStateException("Could not load the " + source.courseKey() + " knowledge catalog.", exception);
        }
    }

    private record CurriculumSource(String courseKey, String resource, String nodeKey) {}

    private record ConceptEntry(
        String courseKey,
        String courseName,
        String coursePath,
        int moduleId,
        String moduleTitle,
        String moduleDescription,
        String topic,
        String explanation,
        String example,
        String officialUrl,
        String officialLabel
    ) {}

    private record ScoredConcept(ConceptEntry concept, int score) {}

    private static final class ModuleMatches {
        private final ConceptEntry lead;
        private final List<String> topics = new ArrayList<>();
        private int bestScore;
        private int supportScore;

        private ModuleMatches(ConceptEntry lead) {
            this.lead = lead;
        }

        private void add(ConceptEntry concept, int conceptScore) {
            bestScore = Math.max(bestScore, conceptScore);
            supportScore += Math.min(conceptScore, 6);
            if (topics.size() < 3 && !topics.contains(concept.topic())) topics.add(concept.topic());
        }

        private int score() {
            return bestScore + Math.min(12, supportScore / 3);
        }

        private KnowledgeMatch response() {
            String encodedTopic = URLEncoder.encode(topics.get(0), StandardCharsets.UTF_8).replace("+", "%20");
            return new KnowledgeMatch(
                lead.courseKey(),
                lead.moduleId(),
                lead.moduleTitle(),
                lead.moduleDescription(),
                List.copyOf(topics),
                lead.explanation(),
                lead.example(),
                "QuickDevBase " + lead.courseName() + " curriculum",
                lead.coursePath() + "?module=" + lead.moduleId() + "&topic=" + encodedTopic + "&source=ask-quickdev",
                lead.officialUrl(),
                lead.officialLabel()
            );
        }
    }

    public record KnowledgeMatch(
        String course,
        int moduleId,
        String moduleTitle,
        String moduleDescription,
        List<String> matchedConcepts,
        String explanation,
        String example,
        String sourceLabel,
        String path,
        String officialUrl,
        String officialLabel
    ) {}
}
