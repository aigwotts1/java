"use strict";

const PATH_TOTAL = 12;
const AI_PATHS = ["generative-ai", "rag", "agentic-ai"];

async function readJson(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

function updatePathCard(path, completed) {
  const card = document.querySelector('[data-ai-path="' + path + '"]');
  if (!card) return;
  const percent = Math.round((completed / PATH_TOTAL) * 100);
  card.querySelector(".path-progress-copy").textContent = completed + " of " + PATH_TOTAL + " modules complete";
  card.querySelector(".path-progress-value").textContent = completed === PATH_TOTAL
    ? "Path complete ✓"
    : completed
      ? percent + "% · Continue ↗"
      : path === "generative-ai" ? "Start here ↗" : "Explore path ↗";
  card.querySelector(".track i").style.width = percent + "%";
}

function updateCollection(totalCompleted) {
  const total = PATH_TOTAL * AI_PATHS.length;
  const percent = Math.round((totalCompleted / total) * 100);
  const collection = document.querySelector("#collectionProgress");
  collection.style.setProperty("--overall-progress", (percent * 3.6) + "deg");
  document.querySelector("#overallPercent").textContent = percent + "%";
  document.querySelector("#overallCaption").textContent = totalCompleted === total
    ? "AI collection complete — three paths finished"
    : totalCompleted + " of " + total + " AI modules complete";
}

async function loadAiProgress() {
  const progress = await Promise.all(AI_PATHS.map((path) => readJson("/api/progress?course=" + encodeURIComponent(path))));
  let totalCompleted = 0;
  progress.forEach((result, index) => {
    const count = result.completed.length;
    totalCompleted += count;
    updatePathCard(AI_PATHS[index], count);
  });
  updateCollection(totalCompleted);
}

initializeLibraryAuth(loadAiProgress);
