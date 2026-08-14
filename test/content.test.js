const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function readLiteral(startMarker, endMarker) {
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing content marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing content marker: ${endMarker}`);
  const literal = appSource.slice(start + startMarker.length, end);
  return Function(`"use strict"; return (${literal});`)();
}

const modules = readLiteral("const modules = ", ";\n\n// Notes are kept");
const quickNotes = readLiteral("const quickNotes = ", ";\n\n// Grouped headings");
const groupedExamples = readLiteral("const groupedExamples = ", ";\n\nconst exampleComments");
const exampleComments = readLiteral("const exampleComments = ", ";\n\nconst stageLabels");

test("curriculum IDs, topic totals, and backend module limit stay aligned", () => {
  assert.equal(modules.length, 18);
  assert.deepEqual(modules.map((module) => module.id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.equal(modules.reduce((total, module) => total + module.topics.length, 0), 135);
  assert.match(serverSource, /const MODULE_COUNT = 18;/);
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
  assert.match(serverSource, /CERTIFICATE_CONSENT_VERSION/);
  assert.match(serverSource, /is_public = FALSE/);

  for (const filename of ["privacy.html", "terms.html", "certificate-policy.html"]) {
    const legalSource = fs.readFileSync(path.join(__dirname, "..", filename), "utf8");
    assert.match(legalSource, /Java Basecamp/);
    assert.match(legalSource, /Oracle/);
  }
});
