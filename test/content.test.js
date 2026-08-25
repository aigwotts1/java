const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const courseCatalogSource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "course", "CourseCatalog.java"), "utf8");
const settingsSource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "config", "AppSettings.java"), "utf8");
const certificateServiceSource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "certificate", "CertificateService.java"), "utf8");
const securitySource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "security", "SecurityConfig.java"), "utf8");
const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const homeSource = fs.readFileSync(path.join(__dirname, "..", "home.html"), "utf8");
const dockerSource = fs.readFileSync(path.join(__dirname, "..", "docker-data.js"), "utf8");
const pythonSource = fs.readFileSync(path.join(__dirname, "..", "python-data.js"), "utf8");
const sqlSource = fs.readFileSync(path.join(__dirname, "..", "sql-data.js"), "utf8");
const aiSource = fs.readFileSync(path.join(__dirname, "..", "ai-data.js"), "utf8");
const aiHubSource = fs.readFileSync(path.join(__dirname, "..", "ai.html"), "utf8");
const javaCourse = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "main", "resources", "curriculum", "java.json"), "utf8"));
const dockerKnowledge = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "main", "resources", "curriculum", "docker.json"), "utf8"));
const pythonKnowledge = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "main", "resources", "curriculum", "python.json"), "utf8"));
const sqlKnowledge = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "main", "resources", "curriculum", "sql.json"), "utf8"));
const aiKnowledge = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "main", "resources", "curriculum", "ai.json"), "utf8"));
const modules = javaCourse.modules;
const quickNotes = javaCourse.quickNotes;
const groupedExamples = javaCourse.groupedExamples;
const exampleComments = javaCourse.exampleComments;
const aiCourses = Function("window", aiSource + "; return window.QUICKDEV_AI_COURSES;")({});
const dockerCourse = Function("window", `${dockerSource}; return window.QUICKDEV_COURSE;`)({});
const pythonCourse = Function("window", `${pythonSource}; return window.QUICKDEV_COURSE;`)({});
const sqlCourse = Function("window", `${sqlSource}; return window.QUICKDEV_COURSE;`)({});

test("server-side retrieval catalogs stay synchronized with every browser curriculum", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(dockerCourse)), dockerKnowledge);
  assert.deepEqual(JSON.parse(JSON.stringify(pythonCourse)), pythonKnowledge);
  assert.deepEqual(JSON.parse(JSON.stringify(sqlCourse)), sqlKnowledge);
  assert.deepEqual(JSON.parse(JSON.stringify(aiCourses)), aiKnowledge);
});

test("curriculum IDs, topic totals, and Spring backend module limit stay aligned", () => {
  assert.equal(modules.length, 18);
  assert.deepEqual(modules.map((module) => module.id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.equal(modules.reduce((total, module) => total + module.topics.length, 0), 148);
  assert.match(courseCatalogSource, /"java-basecamp-complete"[\s\S]*?18, 148/);
});

test("Docker path covers a complete 18-module, 126-concept official-doc map", () => {
  assert.equal(dockerCourse.modules.length, 18);
  assert.deepEqual(dockerCourse.modules.map((module) => module.id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.equal(dockerCourse.modules.reduce((total, module) => total + module.topics.length, 0), 126);
  for (const module of dockerCourse.modules) {
    assert.equal(dockerCourse.quickNotes[module.id].length, module.topics.length);
    assert.match(module.officialUrl, /^https:\/\/docs\.docker\.com\//);
  }
  assert.ok(dockerCourse.modules.some((module) => module.topics.includes("Named volumes")));
  assert.ok(dockerCourse.modules.some((module) => module.topics.includes("Compose Watch")));
  assert.ok(dockerCourse.modules.some((module) => module.topics.includes("Rootless mode")));
  assert.ok(dockerCourse.modules.some((module) => module.topics.includes("Multi-platform publishing")));
});

test("Python path covers a complete 18-module, 126-concept official-doc map", () => {
  assert.equal(pythonCourse.modules.length, 18);
  assert.deepEqual(pythonCourse.modules.map((module) => module.id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.equal(pythonCourse.modules.reduce((total, module) => total + module.topics.length, 0), 126);
  for (const module of pythonCourse.modules) {
    assert.equal(pythonCourse.quickNotes[module.id].length, module.topics.length);
    assert.match(module.officialUrl, /^https:\/\/(docs\.python\.org\/3\/|packaging\.python\.org\/)/);
  }
  assert.ok(pythonCourse.modules.some((module) => module.topics.includes("Generator functions & yield")));
  assert.ok(pythonCourse.modules.some((module) => module.topics.includes("Protocols")));
  assert.ok(pythonCourse.modules.some((module) => module.topics.includes("REST methods: GET, POST, PUT, PATCH & DELETE")));
  assert.ok(pythonCourse.modules.some((module) => module.topics.includes("Virtual environments")));
  assert.deepEqual(
    pythonCourse.groupedExamples["REST methods: GET, POST, PUT, PATCH & DELETE"].map(([label]) => label),
    ["GET", "POST", "PUT", "PATCH", "DELETE"],
  );
  assert.match(pythonCourse.exampleComments.GET, /return a resource/);
  assert.match(pythonCourse.exampleComments.POST, /create a resource/);
  assert.match(pythonCourse.exampleComments.PUT, /complete replacement/);
  assert.match(pythonCourse.exampleComments.PATCH, /only the fields/);
  assert.match(pythonCourse.exampleComments.DELETE, /remove the resource/);
  for (const [topic, examples] of Object.entries(pythonCourse.groupedExamples)) {
    for (const [label] of examples) {
      assert.ok(pythonCourse.exampleComments[label], `${topic} / ${label} is missing its beginner comment.`);
    }
  }
});

test("SQL path covers a complete 18-module, 126-concept official-doc map", () => {
  assert.equal(sqlCourse.modules.length, 18);
  assert.deepEqual(sqlCourse.modules.map((module) => module.id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.equal(sqlCourse.modules.reduce((total, module) => total + module.topics.length, 0), 126);
  for (const module of sqlCourse.modules) {
    assert.equal(sqlCourse.quickNotes[module.id].length, module.topics.length);
    assert.match(module.officialUrl, /^https:\/\/www\.postgresql\.org\/docs\/current\//);
  }
  assert.ok(sqlCourse.modules.some((module) => module.topics.includes("PRIMARY KEY")));
  assert.ok(sqlCourse.modules.some((module) => module.topics.includes("INNER JOIN")));
  assert.ok(sqlCourse.modules.some((module) => module.topics.includes("Common table expressions")));
  assert.ok(sqlCourse.modules.some((module) => module.topics.includes("Window frames")));
  assert.ok(sqlCourse.modules.some((module) => module.topics.includes("EXPLAIN ANALYZE")));
  assert.ok(sqlCourse.modules.some((module) => module.topics.includes("Row-level security")));
  for (const [topic, examples] of Object.entries(sqlCourse.groupedExamples)) {
    for (const [label] of examples) {
      assert.ok(sqlCourse.exampleComments[label], `${topic} / ${label} is missing its query explanation.`);
    }
  }
});

test("AI hub contains three complete, independently trackable 12-module paths", () => {
  assert.deepEqual(Object.keys(aiCourses), ["generative-ai", "rag", "agentic-ai"]);
  for (const [key, course] of Object.entries(aiCourses)) {
    assert.equal(course.key, key);
    assert.equal(course.modules.length, 12);
    assert.deepEqual(course.modules.map((module) => module.id), Array.from({ length: 12 }, (_, index) => index + 1));
    assert.equal(course.modules.reduce((total, module) => total + module.topics.length, 0), 84);
    for (const module of course.modules) {
      assert.equal(course.quickNotes[module.id].length, module.topics.length);
      assert.match(module.officialUrl, /^https:\/\//);
    }
  }

  assert.ok(aiCourses["generative-ai"].modules.some((module) => module.topics.includes("Transformer architecture")));
  assert.ok(aiCourses.rag.modules.some((module) => module.topics.includes("Reciprocal rank fusion")));
  assert.ok(aiCourses["agentic-ai"].modules.some((module) => module.topics.includes("Model Context Protocol")));
  assert.ok(aiCourses["agentic-ai"].modules.some((module) => module.topics.includes("Indirect prompt injection")));
  assert.match(aiHubSource, /Generative AI Foundations/);
  assert.match(aiHubSource, /RAG Systems/);
  assert.match(aiHubSource, /Agentic AI/);
  assert.equal(aiCourses.rag.certificateTitleHtml, "RAG Systems Topics<br>at a Glance");
});

test("every curriculum topic has a matching quick explanation", () => {
  for (const module of modules) {
    assert.ok(quickNotes[module.id], `Module ${module.id} is missing quick explanations.`);
    assert.equal(
      quickNotes[module.id].length,
      module.topics.length,
      `Module ${module.id} topic and explanation counts differ.`,
    );
  }
});

test("every labeled tiny example has a beginner comment", () => {
  for (const [topic, examples] of Object.entries(groupedExamples)) {
    for (const [label] of examples) {
      assert.ok(exampleComments[label], `${topic} / ${label} is missing its beginner comment.`);
    }
  }
});

test("topic definitions and code comments remain separate learning layers", () => {
  const normalize = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const verifyCourse = (course) => {
    for (const module of course.modules) {
      module.topics.forEach((topic, index) => {
        const definition = course.quickNotes[module.id][index][0];
        for (const [label] of course.groupedExamples[topic] || []) {
          const comment = course.exampleComments[label];
          assert.ok(comment, `${course.key} / ${topic} / ${label} is missing its code comment.`);
          assert.notEqual(
            normalize(comment),
            normalize(definition),
            `${course.key} / ${topic} repeats its definition as the code comment.`,
          );
        }
      });
    }
  };

  verifyCourse({
    key: "java",
    modules,
    quickNotes,
    groupedExamples,
    exampleComments,
  });
  verifyCourse(dockerCourse);
  verifyCourse(pythonCourse);
  verifyCourse(sqlCourse);
  Object.values(aiCourses).forEach(verifyCourse);
});

test("modern Java and REST API coverage includes the requested concepts", () => {
  const modernJava = modules.find((module) => module.id === 6);
  assert.equal(modernJava.title, "Modern Java: 8, 11, 17 & 21");
  assert.ok(modernJava.topics.includes("Collectors, grouping & partitioning"));
  assert.ok(modernJava.topics.includes("CompletableFuture"));
  assert.ok(modernJava.topics.includes("Java 11: HTTP Client"));
  assert.ok(modernJava.topics.includes("Sealed classes (Java 17)"));
  assert.ok(modernJava.topics.includes("Virtual threads (Java 21)"));
  assert.ok(modernJava.topics.includes("Pattern matching for switch (Java 21)"));
  assert.ok(modernJava.topics.includes("Structured concurrency & scoped values (Java 21 preview)"));

  const rest = modules.find((module) => module.id === 18);
  assert.equal(rest.title, "REST APIs with Spring Boot");
  assert.ok(rest.topics.includes("HTTP methods: GET, POST, PUT, PATCH & DELETE"));
  assert.deepEqual(
    groupedExamples["HTTP methods: GET, POST, PUT, PATCH & DELETE"].map(([label]) => label),
    ["GET", "POST", "PUT", "PATCH", "DELETE"],
  );
});

test("Ask QuickDev stays lesson-scoped, authenticated, bounded, and privacy-aware", () => {
  const aiSettingsSource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "ai", "AiSettings.java"), "utf8");
  const aiPromptSource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "ai", "AiPromptFactory.java"), "utf8");
  const migrationSource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "resources", "db", "migration", "V2__ai_guide.sql"), "utf8");
  const privacySource = fs.readFileSync(path.join(__dirname, "..", "privacy.html"), "utf8");

  assert.match(indexSource, /id="aiGuideTitle">Ask QuickDev/);
  assert.match(indexSource, /Your name, email, progress, and certificate are not sent/);
  assert.match(appSource, /context: lessonContext\(module\)/);
  assert.match(appSource, /textContent = result\.answer/);
  assert.doesNotMatch(appSource, /innerHTML = result\.answer/);
  assert.match(securitySource, /"\/api\/ai\/\*\*"/);
  assert.match(aiSettingsSource, /AI_DAILY_LIMIT/);
  assert.match(aiSettingsSource, /AI_GLOBAL_DAILY_LIMIT/);
  assert.match(aiSettingsSource, /AI_MAX_OUTPUT_TOKENS/);
  assert.match(aiPromptSource, /untrusted quoted data/);
  assert.match(migrationSource, /CREATE TABLE ai_usage_daily/);
  assert.match(migrationSource, /CREATE TABLE ai_answer_cache/);
  assert.match(privacySource, /unpaid-service content may be used to improve its products/);
});

test("image discovery is grounded across every curriculum and deep-links to any course", () => {
  const discoverySource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "ai", "AiDiscoveryService.java"), "utf8");
  const knowledgeSource = fs.readFileSync(path.join(__dirname, "..", "src", "main", "java", "com", "quickdevbase", "ai", "KnowledgeCatalog.java"), "utf8");
  const homeScript = fs.readFileSync(path.join(__dirname, "..", "home.js"), "utf8");
  const privacySource = fs.readFileSync(path.join(__dirname, "..", "privacy.html"), "utf8");

  assert.match(homeSource, /id="askQuickDev"/);
  assert.match(homeSource, /id="discoveryImage"/);
  assert.match(homeSource, /PNG, JPEG, or WebP/);
  assert.match(homeScript, /\/api\/ai\/discover/);
  assert.match(homeScript, /textContent = result\.answer/);
  assert.doesNotMatch(homeScript, /innerHTML = result\.answer/);
  assert.match(discoverySource, /MAX_IMAGE_BYTES = 5L \* 1024 \* 1024/);
  assert.match(discoverySource, /detectedMediaType/);
  assert.match(knowledgeSource, /curriculum\/java\.json/);
  assert.match(knowledgeSource, /curriculum\/docker\.json/);
  assert.match(knowledgeSource, /curriculum\/python\.json/);
  assert.match(knowledgeSource, /curriculum\/sql\.json/);
  assert.match(knowledgeSource, /curriculum\/ai\.json/);
  assert.doesNotMatch(appSource, /courseConfig\.key !== "java"/);
  assert.match(appSource, /URLSearchParams\(location\.search\)/);
  assert.match(privacySource, /Uploaded images and their extracted text are not retained after processing/);
});

test("certificate publication is consent-based and completion-only language is visible", () => {
  assert.match(indexSource, /Claim &amp; publish certificate/);
  assert.match(indexSource, /I consent to publish my chosen name/);
  assert.match(indexSource, /not professional certification/);
  assert.match(indexSource, /not affiliated with or endorsed by Oracle/);
  assert.match(homeSource, /QuickDevBase/);
  assert.match(homeSource, /Developer knowledge, at a glance/i);
  assert.match(homeSource, /href="\/java"/);
  assert.match(homeSource, /href="\/docker"/);
  assert.match(homeSource, /href="\/python"/);
  assert.match(homeSource, /href="\/sql"/);
  assert.match(homeSource, /href="\/ai"/);
  assert.match(homeSource, /class="team-link" href="\/team"/);
  assert.doesNotMatch(homeSource, /Abhinav Vashishth/);
  assert.match(homeSource, /rel="icon" type="image\/png" href="\/quickdevbase-logo\.png"/);
  const teamSource = fs.readFileSync(path.join(__dirname, "..", "team.html"), "utf8");
  assert.match(teamSource, /Abhinav Vashishth/);
  assert.match(teamSource, /https:\/\/www\.linkedin\.com\/in\/abhinavvashishth\//);
  assert.match(teamSource, /https:\/\/aigwotts1\.github\.io\/portfolio\//);
  assert.match(teamSource, /mailto:vashishthabhinav9@gmail\.com/);
  assert.match(teamSource, /full-stack and backend development/);
  assert.match(teamSource, /generative AI, RAG, and agentic systems/);
  assert.match(settingsSource, /CONSENT_VERSION = "2026-08-14"/);
  assert.match(certificateServiceSource, /is_public = FALSE/);
  assert.match(securitySource, /CookieCsrfTokenRepository/);
  assert.match(appSource, /X-XSRF-TOKEN/);

  for (const filename of ["privacy.html", "terms.html", "certificate-policy.html"]) {
    const legalSource = fs.readFileSync(path.join(__dirname, "..", filename), "utf8");
    assert.match(legalSource, /QuickDevBase/);
    assert.match(legalSource, /Oracle/);
    assert.match(legalSource, /Docker/);
    assert.match(legalSource, /Python Software Foundation/);
    assert.match(legalSource, /OpenAI/);
    assert.match(legalSource, /rel="icon" type="image\/png" href="\/quickdevbase-logo\.png"/);
  }
});
