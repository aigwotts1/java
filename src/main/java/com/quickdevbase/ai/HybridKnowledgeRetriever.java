package com.quickdevbase.ai;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.quickdevbase.ai.KnowledgeCatalog.KnowledgeChunk;
import com.quickdevbase.ai.KnowledgeCatalog.KnowledgeMatch;
import com.quickdevbase.ai.KnowledgeCatalog.RankedChunk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class HybridKnowledgeRetriever {
    private static final Logger log = LoggerFactory.getLogger(HybridKnowledgeRetriever.class);
    private static final double RRF_K = 60.0;

    private final KnowledgeCatalog catalog;
    private final KnowledgeVectorStore vectors;
    private final GeminiClient gemini;
    private final AiSettings settings;

    public HybridKnowledgeRetriever(
        KnowledgeCatalog catalog,
        KnowledgeVectorStore vectors,
        GeminiClient gemini,
        AiSettings settings
    ) {
        this.catalog = catalog;
        this.vectors = vectors;
        this.gemini = gemini;
        this.settings = settings;
    }

    public RetrievalResult retrieve(String query, int limit, boolean allowSemanticSearch) {
        List<RankedChunk> lexical = catalog.rankedSearch(query, 20);
        if (!allowSemanticSearch || !settings.ragEnabled()) {
            return new RetrievalResult(catalog.matches(lexical, limit), "lexical", false);
        }

        try {
            String model = settings.embeddingModel();
            if (vectors.indexedCount(model) < catalog.conceptCount()) {
                return new RetrievalResult(catalog.matches(lexical, limit), "lexical", false);
            }
            var queryEmbedding = gemini.embedQuery(query);
            var semantic = vectors.semanticSearch(queryEmbedding, model, 20, settings.semanticThreshold());
            if (semantic.isEmpty()) {
                return new RetrievalResult(catalog.matches(lexical, limit), "lexical", false);
            }

            Map<String, Double> scores = new HashMap<>();
            Map<String, KnowledgeChunk> chunks = new HashMap<>();
            for (int rank = 0; rank < lexical.size(); rank++) {
                KnowledgeChunk chunk = lexical.get(rank).chunk();
                chunks.put(chunk.chunkKey(), chunk);
                scores.merge(chunk.chunkKey(), 1.25 / (RRF_K + rank + 1), Double::sum);
            }
            for (int rank = 0; rank < semantic.size(); rank++) {
                KnowledgeChunk chunk = catalog.byChunkKey(semantic.get(rank).chunkKey());
                if (chunk == null) continue;
                chunks.put(chunk.chunkKey(), chunk);
                scores.merge(chunk.chunkKey(), 1.0 / (RRF_K + rank + 1), Double::sum);
            }

            List<RankedChunk> fused = new ArrayList<>();
            scores.forEach((key, score) -> fused.add(new RankedChunk(chunks.get(key), score * 10_000)));
            fused.sort(Comparator.comparingDouble(RankedChunk::score).reversed()
                .thenComparing(candidate -> candidate.chunk().courseKey())
                .thenComparing(candidate -> candidate.chunk().moduleId())
                .thenComparing(candidate -> candidate.chunk().topic()));
            return new RetrievalResult(catalog.matches(fused, limit), "hybrid", true);
        } catch (RuntimeException exception) {
            log.warn("Semantic retrieval fell back to lexical matching: {}", exception.getMessage());
            return new RetrievalResult(catalog.matches(lexical, limit), "lexical", false);
        }
    }

    public record RetrievalResult(List<KnowledgeMatch> matches, String mode, boolean semanticUsed) {}
}
