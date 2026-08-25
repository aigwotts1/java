"use strict";

let homeUser = null;
let discoveryPreviewUrl = null;

async function readJson(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

function updateCard(course, completed, total) {
  const card = document.querySelector('[data-course-card="' + course + '"]');
  if (!card) return;
  const percent = Math.round((completed / total) * 100);
  card.querySelector(".progress-copy").textContent = completed + " of " + total + " modules complete";
  card.querySelector(".progress-value").textContent = completed === total ? "Path complete ✓" : completed ? percent + "% · Continue ↗" : "Explore path ↗";
  card.querySelector(".progress-track i").style.width = percent + "%";
}

async function loadHomeProgress() {
  if (!document.querySelector("[data-course-card]")) return;
  const [java, docker, python, sql, generativeAi, rag, agenticAi] = await Promise.all([
    readJson("/api/progress?course=java"),
    readJson("/api/progress?course=docker"),
    readJson("/api/progress?course=python"),
    readJson("/api/progress?course=sql"),
    readJson("/api/progress?course=generative-ai"),
    readJson("/api/progress?course=rag"),
    readJson("/api/progress?course=agentic-ai")
  ]);
  updateCard("java", java.completed.length, 18);
  updateCard("docker", docker.completed.length, 18);
  updateCard("python", python.completed.length, 18);
  updateCard("sql", sql.completed.length, 18);
  updateCard("ai", generativeAi.completed.length + rag.completed.length + agenticAi.completed.length, 36);
}

function initializeHeroDepth() {
  const visual = document.querySelector(".hero-visual");
  const interactionArea = document.querySelector(".hero");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsDesktopPointer = window.matchMedia("(min-width: 681px) and (hover: hover) and (pointer: fine)");
  if (!visual || !interactionArea || prefersReducedMotion.matches || !supportsDesktopPointer.matches) return;

  let frameId = 0;
  let pointerX = 0;
  let pointerY = 0;

  function renderTilt() {
    frameId = 0;
    const bounds = interactionArea.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((pointerX - bounds.left) / bounds.width - .5) * 2));
    const y = Math.max(-1, Math.min(1, ((pointerY - bounds.top) / bounds.height - .5) * 2));

    visual.style.setProperty("--tilt-x", (-y * 5).toFixed(2) + "deg");
    visual.style.setProperty("--tilt-y", (x * 8).toFixed(2) + "deg");
    visual.style.setProperty("--stack-shift-x", (x * 7).toFixed(2) + "px");
    visual.style.setProperty("--stack-shift-y", (y * 5).toFixed(2) + "px");
    visual.style.setProperty("--shine-x", (50 + x * 34).toFixed(1) + "%");
    visual.style.setProperty("--shine-y", (42 + y * 30).toFixed(1) + "%");
    visual.style.setProperty("--card-shadow-x", (-x * 12).toFixed(2) + "px");
    visual.style.setProperty("--card-shadow-y", (35 - y * 7).toFixed(2) + "px");
    visual.style.setProperty("--note-one-x", (-x * 10).toFixed(2) + "px");
    visual.style.setProperty("--note-one-y", (-y * 8).toFixed(2) + "px");
    visual.style.setProperty("--note-two-x", (x * 12).toFixed(2) + "px");
    visual.style.setProperty("--note-two-y", (y * 9).toFixed(2) + "px");
  }

  function queueTilt(event) {
    if (event.pointerType === "touch") return;
    visual.classList.add("is-tilting");
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frameId) frameId = window.requestAnimationFrame(renderTilt);
  }

  function resetTilt() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    visual.classList.remove("is-tilting");
    visual.style.setProperty("--tilt-x", "0deg");
    visual.style.setProperty("--tilt-y", "0deg");
    visual.style.setProperty("--stack-shift-x", "0px");
    visual.style.setProperty("--stack-shift-y", "0px");
    visual.style.setProperty("--shine-x", "50%");
    visual.style.setProperty("--shine-y", "32%");
    visual.style.setProperty("--card-shadow-x", "0px");
    visual.style.setProperty("--card-shadow-y", "35px");
    visual.style.setProperty("--note-one-x", "0px");
    visual.style.setProperty("--note-one-y", "0px");
    visual.style.setProperty("--note-two-x", "0px");
    visual.style.setProperty("--note-two-y", "0px");
  }

  interactionArea.addEventListener("pointermove", queueTilt);
  interactionArea.addEventListener("pointerleave", resetTilt);
  interactionArea.addEventListener("pointercancel", resetTilt);
  window.addEventListener("blur", resetTilt);
}

function updateDiscoveryAuth() {
  const submit = document.querySelector("#discoverySubmit span");
  const note = document.querySelector("#discoveryLoginNote");
  if (!submit || !note) return;
  submit.textContent = homeUser ? "Find my lesson" : "Sign in to find my lesson";
  note.textContent = homeUser
    ? "Hybrid RAG is used when configured, with local curriculum retrieval as the fallback. Uploaded images are not retained."
    : "Sign in to search across the curriculum with grounded retrieval and verified lesson links.";
}

function setDiscoveryStatus(label, busy = false) {
  const status = document.querySelector(".chat-status");
  if (!status) return;
  status.classList.toggle("is-busy", busy);
  status.lastChild.textContent = " " + label;
}

function renderDiscoveryResult(result) {
  const response = document.querySelector("#discoveryResponse");
  const answer = document.querySelector("#discoveryAnswer");
  const detected = document.querySelector("#detectedTopic");
  const results = document.querySelector("#discoveryResults");
  const privacy = document.querySelector("#discoveryPrivacy");

  answer.textContent = result.answer;
  detected.hidden = !result.detectedTopic;
  const retrievalLabel = result.generated
    ? "Grounded RAG"
    : result.retrievalMode === "hybrid" ? "Hybrid retrieval" : "Curriculum retrieval";
  detected.textContent = result.detectedTopic ? retrievalLabel + " · Matched topic · " + result.detectedTopic : "";
  results.replaceChildren();

  for (const [matchIndex, match] of (result.matches || []).entries()) {
    const card = document.createElement("article");
    card.className = "discovery-result-card";

    const source = document.createElement("div");
    source.className = "result-source";
    const sourceName = document.createElement("span");
    sourceName.textContent = "Source [" + (matchIndex + 1) + "] · From " + match.sourceLabel;
    const moduleNumber = document.createElement("span");
    moduleNumber.textContent = "Module " + String(match.moduleId).padStart(2, "0");
    source.append(sourceName, moduleNumber);

    const title = document.createElement("h3");
    title.textContent = match.moduleTitle;
    const explanation = document.createElement("p");
    explanation.textContent = match.explanation;

    const concepts = document.createElement("div");
    concepts.className = "result-concepts";
    for (const concept of match.matchedConcepts) {
      const chip = document.createElement("span");
      chip.textContent = concept;
      concepts.append(chip);
    }

    const actions = document.createElement("div");
    actions.className = "result-actions";
    const lessonLink = document.createElement("a");
    lessonLink.href = match.path;
    lessonLink.textContent = "Open this module ↗";
    const officialLink = document.createElement("a");
    officialLink.href = match.officialUrl;
    officialLink.target = "_blank";
    officialLink.rel = "noopener noreferrer";
    officialLink.textContent = "Official documentation ↗";
    actions.append(lessonLink, officialLink);
    card.append(source, title, explanation, concepts, actions);
    results.append(card);
  }

  privacy.textContent = result.privacyNote || "";
  response.hidden = false;
  const thread = document.querySelector("#discoveryThread");
  requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
}

function updateSelectedImage(file) {
  const title = document.querySelector("#imageDropTitle");
  const hint = document.querySelector("#imageDropHint");
  const preview = document.querySelector("#imagePreview");
  if (discoveryPreviewUrl) URL.revokeObjectURL(discoveryPreviewUrl);
  discoveryPreviewUrl = null;

  if (!file) {
    title.textContent = "Add a screenshot";
    hint.textContent = "PNG, JPEG, or WebP · up to 5 MB";
    preview.hidden = true;
    preview.removeAttribute("src");
    return;
  }
  title.textContent = file.name;
  hint.textContent = (file.size / 1024 / 1024).toFixed(2) + " MB · click to replace";
  discoveryPreviewUrl = URL.createObjectURL(file);
  preview.src = discoveryPreviewUrl;
  preview.hidden = false;
}

function initializeDiscovery() {
  const form = document.querySelector("#discoveryForm");
  const imageInput = document.querySelector("#discoveryImage");
  const drop = document.querySelector("#imageDrop");
  const errorBox = document.querySelector("#discoveryError");
  const submit = document.querySelector("#discoverySubmit");
  if (!form || !imageInput) return;

  imageInput.addEventListener("change", () => updateSelectedImage(imageInput.files[0] || null));
  for (const eventName of ["dragenter", "dragover"]) {
    drop.addEventListener(eventName, (event) => {
      event.preventDefault();
      drop.classList.add("is-dragging");
    });
  }
  for (const eventName of ["dragleave", "drop"]) {
    drop.addEventListener(eventName, (event) => {
      event.preventDefault();
      drop.classList.remove("is-dragging");
    });
  }
  drop.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    imageInput.files = transfer.files;
    updateSelectedImage(file);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    if (!homeUser) {
      errorBox.textContent = "Sign in first, then submit your topic again.";
      errorBox.hidden = false;
      openLibraryAuth("login");
      return;
    }

    const file = imageInput.files[0] || null;
    const question = document.querySelector("#discoveryQuestion").value.trim();
    if (!file && question.length < 2) {
      errorBox.textContent = "Add a screenshot or enter a topic.";
      errorBox.hidden = false;
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      errorBox.textContent = "Choose an image smaller than 5 MB.";
      errorBox.hidden = false;
      return;
    }
    if (file && file.type && !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      errorBox.textContent = "Choose a PNG, JPEG, or WebP image.";
      errorBox.hidden = false;
      return;
    }

    const body = new FormData();
    if (file) body.append("image", file);
    if (question) body.append("question", question);
    submit.disabled = true;
    submit.querySelector("span").textContent = "Searching the curriculum...";
    setDiscoveryStatus("Searching", true);

    try {
      const result = await libraryApiRequest("/api/ai/discover", { method: "POST", body });
      renderDiscoveryResult(result);
      setDiscoveryStatus("Matched");
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      setDiscoveryStatus("Try again");
    } finally {
      submit.disabled = false;
      updateDiscoveryAuth();
    }
  });
}

async function onHomeSignedIn(user) {
  homeUser = user;
  updateDiscoveryAuth();
  try {
    await loadHomeProgress();
  } catch {
    // Authentication and discovery remain usable if progress is temporarily unavailable.
  }
}

initializeDiscovery();
updateDiscoveryAuth();
initializeLibraryAuth(onHomeSignedIn).then((user) => {
  homeUser = user;
  updateDiscoveryAuth();
});
initializeHeroDepth();
