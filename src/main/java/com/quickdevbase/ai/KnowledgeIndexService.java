package com.quickdevbase.ai;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import com.quickdevbase.ai.KnowledgeCatalog.KnowledgeChunk;
import com.quickdevbase.ai.KnowledgeVectorStore.ChunkState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeIndexService {
    private static final Logger log = LoggerFactory.getLogger(KnowledgeIndexService.class);
    private static final int BATCH_SIZE = 64;

    private final AiSettings settings;
    private final KnowledgeCatalog catalog;
    private final KnowledgeVectorStore vectors;
    private final GeminiClient gemini;
    private final TaskExecutor tasks;
    private final AtomicBoolean synchronizing = new AtomicBoolean();

    public KnowledgeIndexService(
        AiSettings settings,
        KnowledgeCatalog catalog,
        KnowledgeVectorStore vectors,
        GeminiClient gemini,
        @Qualifier("applicationTaskExecutor") TaskExecutor tasks
    ) {
        this.settings = settings;
        this.catalog = catalog;
        this.vectors = vectors;
        this.gemini = gemini;
        this.tasks = tasks;
    }

    @EventListener(ApplicationReadyEvent.class)
    void scheduleSynchronization() {
        if (settings.ragEnabled()) tasks.execute(this::synchronize);
    }

    @Scheduled(
        fixedDelayString = "${RAG_SYNC_INTERVAL_MS:21600000}",
        initialDelayString = "${RAG_SYNC_INITIAL_DELAY_MS:600000}"
    )
    void retrySynchronization() {
        if (settings.ragEnabled()) synchronize();
    }

    void synchronize() {
        if (!synchronizing.compareAndSet(false, true)) return;
        String model = settings.embeddingModel();
        try {
            List<KnowledgeChunk> all = catalog.allChunks();
            Map<String, ChunkState> states = vectors.states();
            List<KnowledgeChunk> changed = all.stream()
                .filter(chunk -> {
                    ChunkState state = states.get(chunk.chunkKey());
                    return state == null || !state.matches(chunk, model);
                })
                .toList();

            if (changed.isEmpty()) {
                vectors.deleteMissing(new HashSet<>(all.stream().map(KnowledgeChunk::chunkKey).toList()));
                log.info("Hybrid RAG index is current with {} curriculum chunks.", all.size());
                return;
            }

            log.info("Embedding {} changed curriculum chunks for hybrid RAG.", changed.size());
            for (int offset = 0; offset < changed.size(); offset += BATCH_SIZE) {
                List<KnowledgeChunk> batch = new ArrayList<>(
                    changed.subList(offset, Math.min(offset + BATCH_SIZE, changed.size()))
                );
                List<List<Double>> embeddings = gemini.embedDocuments(batch);
                for (int index = 0; index < batch.size(); index++) {
                    vectors.upsert(batch.get(index), model, embeddings.get(index));
                }
            }
            vectors.deleteMissing(new HashSet<>(all.stream().map(KnowledgeChunk::chunkKey).toList()));
            log.info("Hybrid RAG index synchronized with {} curriculum chunks.", all.size());
        } catch (RuntimeException exception) {
            log.warn("Hybrid RAG indexing did not complete; lexical retrieval remains available: {}",
                exception.getMessage());
        } finally {
            synchronizing.set(false);
        }
    }
}
