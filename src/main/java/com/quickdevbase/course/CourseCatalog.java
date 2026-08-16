package com.quickdevbase.course;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class CourseCatalog {
    private final Map<String, Course> courses = new LinkedHashMap<>();

    public CourseCatalog() {
        add(new Course("java", "java-basecamp-complete", "Java Developer Knowledge Path", "Java at a Glance", "J", 18, 135, "/java",
            "Java fundamentals, OOP, collections, Spring Boot, REST APIs, JVM internals, testing, and DSA.",
            "Java is a trademark of Oracle and/or its affiliates. QuickDevBase is not affiliated with or endorsed by Oracle."));
        add(new Course("docker", "docker-developer-knowledge", "Docker Developer Knowledge Path", "Docker at a Glance", "D", 18, 126, "/docker",
            "Docker architecture, containers, images, Dockerfiles, BuildKit, storage, networking, Compose, security, CI/CD, and Swarm.",
            "Docker and the Docker logo are trademarks or registered trademarks of Docker, Inc. QuickDevBase is not affiliated with or endorsed by Docker, Inc."));
        add(new Course("python", "python-developer-knowledge", "Python Developer Knowledge Path", "Python at a Glance", "Py", 18, 126, "/python",
            "Python fundamentals, collections, functions, object protocols, files, typing, testing, concurrency, SQLite, HTTP APIs, packaging, performance, and security.",
            "Python and the Python logos are trademarks or registered trademarks of the Python Software Foundation. QuickDevBase is not affiliated with or endorsed by the Python Software Foundation."));
        add(new Course("generative-ai", "generative-ai-foundations", "Generative AI Foundations Knowledge Path", "Generative AI at a Glance", "G", 12, 84, "/ai/generative-ai",
            "AI foundations, transformers, tokens, embeddings, prompting, structured outputs, multimodality, customization, evaluation, safety, and production trade-offs.",
            independentAiNotice()));
        add(new Course("rag", "rag-systems-knowledge", "RAG Systems Knowledge Path", "RAG at a Glance", "R", 12, 84, "/ai/rag",
            "document ingestion, chunking, metadata, embeddings, vector search, hybrid retrieval, query transformation, reranking, grounded generation, evaluation, and production operations.",
            independentAiNotice()));
        add(new Course("agentic-ai", "agentic-ai-knowledge", "Agentic AI Knowledge Path", "Agentic AI at a Glance", "A", 12, 84, "/ai/agents",
            "agent loops, tools, state, memory, planning, workflow patterns, multi-agent orchestration, MCP, human approval, reliability, tracing, evaluation, and guardrails.",
            independentAiNotice()));
    }

    private static String independentAiNotice() {
        return "QuickDevBase is an independent educational project. Provider names and product marks belong to their respective owners; no vendor endorses this completion record.";
    }

    private void add(Course course) {
        courses.put(course.key(), course);
    }

    public Course byKeyOrJava(String key) {
        return courses.getOrDefault(key == null ? "java" : key.toLowerCase(), courses.get("java"));
    }

    public Optional<Course> byCode(String code) {
        return courses.values().stream().filter(course -> course.code().equals(code)).findFirst();
    }

    public Optional<Course> byKey(String key) {
        if (key == null) return Optional.empty();
        return Optional.ofNullable(courses.get(key.toLowerCase()));
    }

    public record Course(
        String key,
        String code,
        String title,
        String shortTitle,
        String mark,
        int moduleCount,
        int conceptCount,
        String path,
        String summary,
        String trademark
    ) {}
}
