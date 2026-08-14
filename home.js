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
    const [java, docker, generativeAi, rag, agenticAi] = await Promise.all([
      readJson("/api/progress?course=java"),
      readJson("/api/progress?course=docker"),
      readJson("/api/progress?course=generative-ai"),
      readJson("/api/progress?course=rag"),
      readJson("/api/progress?course=agentic-ai")
    ]);
    updateCard("java", java.completed.length, 18);
    updateCard("docker", docker.completed.length, 18);
    updateCard("ai", generativeAi.completed.length + rag.completed.length + agenticAi.completed.length, 36);
  } catch {
    accountStatus.querySelector("span").textContent = "Progress sync reconnecting";
  }
}

initializeHome();
