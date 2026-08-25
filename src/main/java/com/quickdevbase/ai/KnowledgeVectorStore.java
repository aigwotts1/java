package com.quickdevbase.ai;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.quickdevbase.ai.KnowledgeCatalog.KnowledgeChunk;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class KnowledgeVectorStore {
    private final JdbcTemplate jdbc;
    private final AiSettings settings;

    public KnowledgeVectorStore(JdbcTemplate jdbc, AiSettings settings) {
        this.jdbc = jdbc;
        this.settings = settings;
    }

    public Map<String, ChunkState> states() {
        Map<String, ChunkState> states = new HashMap<>();
        jdbc.query(
            "SELECT chunk_key, content_hash, embedding_model, embedding IS NOT NULL AS embedded FROM knowledge_chunks",
            (row, index) -> Map.entry(row.getString("chunk_key"), new ChunkState(
                row.getString("content_hash"), row.getString("embedding_model"), row.getBoolean("embedded")
            ))
        ).forEach(entry -> states.put(entry.getKey(), entry.getValue()));
        return states;
    }

    public int indexedCount(String model) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM knowledge_chunks WHERE embedding_model = ? AND embedding IS NOT NULL",
            Integer.class,
            model
        );
        return count == null ? 0 : count;
    }

    public void upsert(KnowledgeChunk chunk, String model, List<Double> embedding) {
        jdbc.update(
            """
            INSERT INTO knowledge_chunks (
              chunk_key, course_key, course_name, module_id, module_title, topic, content,
              lesson_path, official_url, source_label, content_hash, embedding_model, embedding
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::vector)
            ON CONFLICT (chunk_key) DO UPDATE SET
              course_key = EXCLUDED.course_key,
              course_name = EXCLUDED.course_name,
              module_id = EXCLUDED.module_id,
              module_title = EXCLUDED.module_title,
              topic = EXCLUDED.topic,
              content = EXCLUDED.content,
              lesson_path = EXCLUDED.lesson_path,
              official_url = EXCLUDED.official_url,
              source_label = EXCLUDED.source_label,
              content_hash = EXCLUDED.content_hash,
              embedding_model = EXCLUDED.embedding_model,
              embedding = EXCLUDED.embedding,
              updated_at = NOW()
            """,
            chunk.chunkKey(),
            chunk.courseKey(),
            chunk.courseName(),
            chunk.moduleId(),
            chunk.moduleTitle(),
            chunk.topic(),
            chunk.documentText(),
            chunk.lessonPath(),
            chunk.officialUrl(),
            chunk.sourceLabel(),
            chunk.contentHash(),
            model,
            vectorLiteral(embedding)
        );
    }

    public List<SemanticHit> semanticSearch(List<Double> queryEmbedding, String model, int limit, double threshold) {
        String vector = vectorLiteral(queryEmbedding);
        return jdbc.query(
            """
            SELECT chunk_key, 1 - (embedding <=> ?::vector) AS similarity
            FROM knowledge_chunks
            WHERE embedding_model = ? AND embedding IS NOT NULL
            ORDER BY embedding <=> ?::vector
            LIMIT ?
            """,
            (row, index) -> new SemanticHit(row.getString("chunk_key"), row.getDouble("similarity")),
            vector,
            model,
            vector,
            Math.max(1, Math.min(limit, 50))
        ).stream().filter(hit -> hit.similarity() >= threshold).toList();
    }

    public void deleteMissing(Set<String> currentChunkKeys) {
        Set<String> stale = new HashSet<>(states().keySet());
        stale.removeAll(currentChunkKeys);
        stale.forEach(key -> jdbc.update("DELETE FROM knowledge_chunks WHERE chunk_key = ?", key));
    }

    private String vectorLiteral(List<Double> values) {
        if (values == null || values.size() != settings.embeddingDimensions()) {
            throw new IllegalArgumentException(
                "Expected a " + settings.embeddingDimensions() + "-dimension embedding."
            );
        }
        StringBuilder vector = new StringBuilder(values.size() * 12).append('[');
        for (int index = 0; index < values.size(); index++) {
            Double value = values.get(index);
            if (value == null || !Double.isFinite(value)) {
                throw new IllegalArgumentException("Embedding contains a non-finite value.");
            }
            if (index > 0) vector.append(',');
            vector.append(value);
        }
        return vector.append(']').toString();
    }

    public record ChunkState(String contentHash, String embeddingModel, boolean embedded) {
        public boolean matches(KnowledgeChunk chunk, String model) {
            return embedded && chunk.contentHash().equals(contentHash) && model.equals(embeddingModel);
        }
    }

    public record SemanticHit(String chunkKey, double similarity) {}
}
