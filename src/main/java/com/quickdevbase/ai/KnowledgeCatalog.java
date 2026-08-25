package com.quickdevbase.ai;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
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

    private final List<KnowledgeChunk> concepts;
    private final Map<String, KnowledgeChunk> conceptsByKey;

    public KnowledgeCatalog(ObjectMapper mapper, CourseCatalog courses) {
        this.concepts = load(mapper, courses);
        Map<String, KnowledgeChunk> indexed = new HashMap<>();
        concepts.forEach(concept -> indexed.put(concept.chunkKey(), concept));
        this.conceptsByKey = Map.copyOf(indexed);
    }

    public List<KnowledgeMatch> search(String rawQuery, int limit) {
        return matches(rankedSearch(rawQuery, 60), limit);
    }

    public List<RankedChunk> rankedSearch(String rawQuery, int limit) {
        String query = normalize(rawQuery);
        if (query.isBlank()) return List.of();

        Set<String> queryTokens = usefulTokens(query);
        return concepts.stream()
            .map(concept -> new ScoredConcept(concept, score(query, queryTokens, concept)))
            .filter(candidate -> candidate.score() >= 4)
            .sorted(Comparator.comparingInt(ScoredConcept::score).reversed()
                .thenComparing(candidate -> candidate.concept().courseKey())
                .thenComparing(candidate -> candidate.concept().moduleId())
                .thenComparing(candidate -> candidate.concept().topic()))
            .limit(Math.max(1, Math.min(limit, 100)))
            .map(candidate -> new RankedChunk(candidate.concept(), candidate.score()))
            .toList();
    }

    public List<KnowledgeMatch> matches(List<RankedChunk> ranked, int limit) {
        Map<String, ModuleMatches> modules = new LinkedHashMap<>();
        for (RankedChunk candidate : ranked) {
            KnowledgeChunk concept = candidate.chunk();
            String moduleKey = concept.courseKey() + ":" + concept.moduleId();
            ModuleMatches group = modules.computeIfAbsent(moduleKey, ignored -> new ModuleMatches(concept));
            group.add(concept, candidate.score());
        }

        return modules.values().stream()
            .sorted(Comparator.comparingDouble(ModuleMatches::score).reversed())
            .limit(Math.max(1, Math.min(limit, 5)))
            .map(ModuleMatches::response)
            .toList();
    }

    public List<KnowledgeChunk> allChunks() {
        return concepts;
    }

    public KnowledgeChunk byChunkKey(String chunkKey) {
        return conceptsByKey.get(chunkKey);
    }

    public int conceptCount() {
        return concepts.size();
    }

    private static int score(String query, Set<String> queryTokens, KnowledgeChunk concept) {
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

    private static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private static List<KnowledgeChunk> load(ObjectMapper mapper, CourseCatalog courses) {
        List<KnowledgeChunk> loaded = new ArrayList<>();
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
        List<KnowledgeChunk> loaded
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
                    String topic = topics.get(index).asText();
                    loaded.add(new KnowledgeChunk(
                        hash(course.key() + ":" + moduleId + ":" + topic),
                        course.key(),
                        courseName,
                        course.path(),
                        moduleId,
                        module.path("title").asText(),
                        module.path("description").asText(),
                        topic,
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

    public record KnowledgeChunk(
        String chunkKey,
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
    ) {
        public String sourceLabel() {
            return "QuickDevBase " + courseName + " curriculum";
        }

        public String lessonPath() {
            String encodedTopic = URLEncoder.encode(topic, StandardCharsets.UTF_8).replace("+", "%20");
            return coursePath + "?module=" + moduleId + "&topic=" + encodedTopic + "&source=ask-quickdev";
        }

        public String documentText() {
            return "Course: " + courseName + "\nModule: " + moduleTitle + "\nTopic: " + topic
                + "\nModule description: " + moduleDescription + "\nExplanation: " + explanation
                + (example.isBlank() ? "" : "\nExample: " + example);
        }

        public String contentHash() {
            return hash(documentText() + "\n" + officialUrl + "\n" + lessonPath());
        }
    }

    private record ScoredConcept(KnowledgeChunk concept, int score) {}

    public record RankedChunk(KnowledgeChunk chunk, double score) {}

    private static final class ModuleMatches {
        private final KnowledgeChunk lead;
        private final List<String> topics = new ArrayList<>();
        private double bestScore;
        private double supportScore;

        private ModuleMatches(KnowledgeChunk lead) {
            this.lead = lead;
        }

        private void add(KnowledgeChunk concept, double conceptScore) {
            bestScore = Math.max(bestScore, conceptScore);
            supportScore += Math.min(conceptScore, 6);
            if (topics.size() < 3 && !topics.contains(concept.topic())) topics.add(concept.topic());
        }

        private double score() {
            return bestScore + Math.min(12, supportScore / 3);
        }

        private KnowledgeMatch response() {
            return new KnowledgeMatch(
                lead.courseKey(),
                lead.moduleId(),
                lead.moduleTitle(),
                lead.moduleDescription(),
                List.copyOf(topics),
                lead.explanation(),
                lead.example(),
                lead.sourceLabel(),
                lead.lessonPath(),
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
