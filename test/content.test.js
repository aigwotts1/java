const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const homeSource = fs.readFileSync(path.join(__dirname, "..", "home.html"), "utf8");
const dockerSource = fs.readFileSync(path.join(__dirname, "..", "docker-data.js"), "utf8");
const pythonSource = fs.readFileSync(path.join(__dirname, "..", "python-data.js"), "utf8");
const aiSource = fs.readFileSync(path.join(__dirname, "..", "ai-data.js"), "utf8");
const aiHubSource = fs.readFileSync(path.join(__dirname, "..", "ai.html"), "utf8");

function readLiteral(startMarker, endMarker) {
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing content marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing content marker: ${endMarker}`);
  const literal = appSource.slice(start + startMarker.length, end);
  return Function(`"use strict"; return (${literal});`)();
}

const modules = readLiteral("const javaModules = ", ";\n\n// Notes are kept");
const quickNotes = readLiteral("const javaQuickNotes = ", ";\n\n// Grouped headings");
const groupedExamples = readLiteral("const javaGroupedExamples = ", ";\n\nconst javaExampleComments");
const exampleComments = readLiteral("const javaExampleComments = ", ";\n\nconst javaStageLabels");
const aiCourses = Function("window", aiSource + "; return window.QUICKDEV_AI_COURSES;")({});
const dockerCourse = Function("window", `${dockerSource}; return window.QUICKDEV_COURSE;`)({});
const pythonCourse = Function("window", `${pythonSource}; return window.QUICKDEV_COURSE;`)({});

test("curriculum IDs, topic totals, and backend module limit stay aligned", () => {
  assert.equal(modules.length, 18);
  assert.deepEqual(modules.map((module) => module.id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.equal(modules.reduce((total, module) => total + module.topics.length, 0), 135);
  assert.match(serverSource, /moduleCount: 18/);
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

test("Java 8 and REST API coverage includes the requested concepts", () => {
  const java8 = modules.find((module) => module.id === 6);
  assert.ok(java8.topics.includes("Collectors, grouping & partitioning"));
  assert.ok(java8.topics.includes("CompletableFuture"));

  const rest = modules.find((module) => module.id === 18);
  assert.equal(rest.title, "REST APIs with Spring Boot");
  assert.ok(rest.topics.includes("HTTP methods: GET, POST, PUT, PATCH & DELETE"));
  assert.deepEqual(
    groupedExamples["HTTP methods: GET, POST, PUT, PATCH & DELETE"].map(([label]) => label),
    ["GET", "POST", "PUT", "PATCH", "DELETE"],
  );
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
  assert.match(homeSource, /href="\/ai"/);
  assert.match(homeSource, /class="team-link" href="\/team"/);
  assert.doesNotMatch(homeSource, /Abhinav Vashishth/);
  assert.match(homeSource, /rel="icon" type="image\/png" href="\/quickdevbase-logo\.png"/);
  const teamSource = fs.readFileSync(path.join(__dirname, "..", "team.html"), "utf8");
  assert.match(teamSource, /Abhinav Vashishth/);
  assert.match(teamSource, /mailto:vashishthabhinav9@gmail\.com/);
  assert.match(teamSource, /full-stack and backend development/);
  assert.match(teamSource, /generative AI, RAG, and agentic systems/);
  assert.match(serverSource, /CERTIFICATE_CONSENT_VERSION/);
  assert.match(serverSource, /is_public = FALSE/);

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
