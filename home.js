"use strict";

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

async function initializeHome() {
  const accountStatus = document.querySelector("#accountStatus");
  try {
    const { user } = await readJson("/api/auth/me");
    if (!user) return;
    accountStatus.classList.add("signed-in");
    accountStatus.querySelector("span").textContent = "Welcome back, " + user.name.split(" ")[0];
    const [java, docker, python, generativeAi, rag, agenticAi] = await Promise.all([
      readJson("/api/progress?course=java"),
      readJson("/api/progress?course=docker"),
      readJson("/api/progress?course=python"),
      readJson("/api/progress?course=generative-ai"),
      readJson("/api/progress?course=rag"),
      readJson("/api/progress?course=agentic-ai")
    ]);
    updateCard("java", java.completed.length, 18);
    updateCard("docker", docker.completed.length, 18);
    updateCard("python", python.completed.length, 18);
    updateCard("ai", generativeAi.completed.length + rag.completed.length + agenticAi.completed.length, 36);
  } catch {
    accountStatus.querySelector("span").textContent = "Progress sync reconnecting";
  }
}

function initializeHeroDepth() {
  const visual = document.querySelector(".hero-visual");
  const interactionArea = document.querySelector(".hero");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!visual || !interactionArea || prefersReducedMotion.matches) return;

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

initializeHome();
initializeHeroDepth();
