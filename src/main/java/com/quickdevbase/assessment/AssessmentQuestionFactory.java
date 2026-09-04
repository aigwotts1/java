package com.quickdevbase.assessment;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.quickdevbase.ai.KnowledgeCatalog;
import com.quickdevbase.ai.KnowledgeCatalog.KnowledgeChunk;
import com.quickdevbase.course.CourseCatalog.Course;

public class AssessmentQuestionFactory {
    public static final int QUESTION_COUNT = 15;
    public static final int OPTION_COUNT = 4;

    private final KnowledgeCatalog catalog;
    private final SecureRandom random;

    public AssessmentQuestionFactory(KnowledgeCatalog catalog) {
        this(catalog, new SecureRandom());
    }

    AssessmentQuestionFactory(KnowledgeCatalog catalog, SecureRandom random) {
        this.catalog = catalog;
        this.random = random;
    }

    public List<QuestionDraft> create(Course course, Set<String> excludedChunkKeys) {
        List<KnowledgeChunk> courseChunks = catalog.allChunks().stream()
            .filter(chunk -> chunk.courseKey().equals(course.key()))
            .toList();
        List<KnowledgeChunk> available = courseChunks.stream()
            .filter(chunk -> !excludedChunkKeys.contains(chunk.chunkKey()))
            .toList();
        if (available.size() < QUESTION_COUNT) {
            available = courseChunks;
        }

        Map<Integer, List<KnowledgeChunk>> byModule = new LinkedHashMap<>();
        for (KnowledgeChunk chunk : available) {
            byModule.computeIfAbsent(chunk.moduleId(), ignored -> new ArrayList<>()).add(chunk);
        }
        byModule.values().forEach(list -> Collections.shuffle(list, random));

        List<Integer> moduleIds = new ArrayList<>(byModule.keySet());
        Collections.shuffle(moduleIds, random);
        List<KnowledgeChunk> selected = new ArrayList<>();
        int round = 0;
        while (selected.size() < QUESTION_COUNT) {
            boolean added = false;
            for (Integer moduleId : moduleIds) {
                List<KnowledgeChunk> candidates = byModule.get(moduleId);
                if (round < candidates.size()) {
                    selected.add(candidates.get(round));
                    added = true;
                    if (selected.size() == QUESTION_COUNT) break;
                }
            }
            if (!added) break;
            round++;
        }
        if (selected.size() != QUESTION_COUNT) {
            throw new IllegalStateException("The " + course.key() + " curriculum cannot produce 15 assessment questions.");
        }

        List<QuestionDraft> questions = new ArrayList<>();
        for (int index = 0; index < selected.size(); index++) {
            KnowledgeChunk correct = selected.get(index);
            List<String> distractors = distractors(correct, courseChunks);
            List<String> options = new ArrayList<>();
            options.add(correct.explanation());
            options.addAll(distractors);
            Collections.shuffle(options, random);
            questions.add(new QuestionDraft(
                index + 1,
                correct.chunkKey(),
                correct.moduleId(),
                correct.moduleTitle(),
                "Which statement best explains “" + correct.topic() + "”?",
                List.copyOf(options),
                options.indexOf(correct.explanation())
            ));
        }
        return List.copyOf(questions);
    }

    private List<String> distractors(KnowledgeChunk correct, List<KnowledgeChunk> courseChunks) {
        List<KnowledgeChunk> preferred = new ArrayList<>(courseChunks.stream()
            .filter(chunk -> chunk.moduleId() == correct.moduleId())
            .filter(chunk -> !chunk.chunkKey().equals(correct.chunkKey()))
            .toList());
        Collections.shuffle(preferred, random);

        LinkedHashSet<String> choices = new LinkedHashSet<>();
        for (KnowledgeChunk candidate : preferred) {
            if (!candidate.explanation().equals(correct.explanation())) choices.add(candidate.explanation());
            if (choices.size() == OPTION_COUNT - 1) break;
        }
        if (choices.size() < OPTION_COUNT - 1) {
            List<KnowledgeChunk> fallback = new ArrayList<>(courseChunks);
            Collections.shuffle(fallback, random);
            for (KnowledgeChunk candidate : fallback) {
                if (!candidate.explanation().equals(correct.explanation())) choices.add(candidate.explanation());
                if (choices.size() == OPTION_COUNT - 1) break;
            }
        }
        if (choices.size() != OPTION_COUNT - 1) {
            throw new IllegalStateException("Not enough distinct curriculum explanations for an assessment question.");
        }
        return new ArrayList<>(choices);
    }

    public record QuestionDraft(
        int position,
        String chunkKey,
        int moduleId,
        String moduleTitle,
        String question,
        List<String> options,
        int correctOption
    ) {}
}
