const params = new URLSearchParams(location.search);
const course = params.get("course") || "java";
const courseQuery = `?course=${encodeURIComponent(course)}`;
const intro = document.querySelector("#assessmentIntro");
const exam = document.querySelector("#assessmentExam");
const result = document.querySelector("#assessmentResult");
const startButton = document.querySelector("#startAssessment");
const errorBox = document.querySelector("#assessmentError");
const overlay = document.querySelector("#violationOverlay");
const answerOptions = document.querySelector("#answerOptions");
const questionMap = document.querySelector("#questionMap");

let status = null;
let attempt = null;
let currentQuestion = 0;
let answers = new Map();
let timerHandle = null;
let examActive = false;
let submitting = false;
let violationPending = false;
let lastViolationAt = 0;

function cookieValue(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

async function apiRequest(url, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (needsCsrf && !cookieValue("XSRF-TOKEN")) {
    await fetch("/api/auth/me", { credentials: "same-origin" });
  }
  const csrf = needsCsrf ? cookieValue("XSRF-TOKEN") : null;
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(csrf ? { "X-XSRF-TOKEN": csrf } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function updateCourseUI(data) {
  document.title = `${data.courseName} assessment | QuickDevBase`;
  document.documentElement.dataset.course = data.course;
  document.querySelector("#courseBadge").textContent = `${data.courseName} assessment`;
  document.querySelector("#introDescription").textContent = `You reviewed all ${data.requiredModules} ${data.courseName} modules. Pass this short knowledge check before publishing the completion certificate.`;
  document.querySelector("#courseExit").href = data.coursePath;
  document.querySelector("#introCourseLink").href = data.coursePath;
  document.querySelector("#resultCourseLink").href = `${data.coursePath}?assessment=passed`;
  document.querySelector("#attemptsLabel").textContent = `${data.attemptsRemaining} of 3 attempts available`;
}

async function loadStatus() {
  try {
    status = await apiRequest(`/api/assessment${courseQuery}`);
    updateCourseUI(status);
    if (status.passed) {
      renderAlreadyPassed();
      return;
    }
    if (!status.modulesComplete) {
      startButton.disabled = true;
      startButton.textContent = `Complete ${status.requiredModules - status.completedModules} more module${status.requiredModules - status.completedModules === 1 ? "" : "s"} first`;
      showError("The assessment unlocks only after every module in this path is marked complete.");
      return;
    }
    if (status.activeAttempt) {
      startButton.disabled = false;
      startButton.innerHTML = `Resume attempt ${status.activeAttempt.attemptNumber} <span aria-hidden="true">↗</span>`;
      return;
    }
    if (status.attemptsRemaining <= 0) {
      startButton.disabled = true;
      startButton.textContent = "All three attempts used";
      showError("No assessment attempts remain for this course.");
      return;
    }
    startButton.disabled = false;
    startButton.innerHTML = `Begin attempt ${status.attemptsUsed + 1} <span aria-hidden="true">↗</span>`;
  } catch (error) {
    startButton.disabled = true;
    startButton.textContent = error.status === 401 ? "Sign in from the course page" : "Assessment unavailable";
    showError(error.status === 401 ? "Sign in and complete the course before opening its certificate assessment." : error.message);
  }
}

async function enterFullscreen() {
  if (document.fullscreenElement) return true;
  if (!document.documentElement.requestFullscreen) {
    throw new Error("This assessment requires a browser with fullscreen support.");
  }
  await document.documentElement.requestFullscreen();
  return true;
}

async function beginAssessment() {
  errorBox.hidden = true;
  startButton.disabled = true;
  try {
    await enterFullscreen();
    attempt = status?.activeAttempt || await apiRequest(`/api/assessment/start${courseQuery}`, { method: "POST" });
    showExam(attempt);
  } catch (error) {
    showError(error.message || "Fullscreen permission is required to begin.");
    startButton.disabled = false;
    if (document.fullscreenElement && !examActive) await document.exitFullscreen().catch(() => {});
  }
}

function showExam(activeAttempt) {
  attempt = activeAttempt;
  answers = new Map(activeAttempt.questions
    .filter((question) => question.selectedOption !== null)
    .map((question) => [question.position, question.selectedOption]));
  currentQuestion = Math.max(0, activeAttempt.questions.findIndex((question) => question.selectedOption === null));
  if (currentQuestion < 0) currentQuestion = 0;
  intro.hidden = true;
  result.hidden = true;
  exam.hidden = false;
  document.querySelector("#examAttempt").textContent = `Attempt ${activeAttempt.attemptNumber} of 3`;
  document.querySelector("#examCourse").textContent = status.courseName;
  updateWarningUI(activeAttempt.warningCount);
  examActive = true;
  renderQuestion();
  startTimer();
}

function renderQuestion() {
  const question = attempt.questions[currentQuestion];
  document.querySelector("#questionNumber").textContent = `Question ${String(question.position).padStart(2, "0")} of ${attempt.questionCount}`;
  document.querySelector("#questionModule").textContent = `Module ${String(question.moduleId).padStart(2, "0")} · ${question.moduleTitle}`;
  document.querySelector("#questionTitle").textContent = question.question;
  document.querySelector("#examProgressBar").style.width = `${((currentQuestion + 1) / attempt.questionCount) * 100}%`;
  answerOptions.innerHTML = question.options.map((option, index) => `
    <label class="answer-choice">
      <input type="radio" name="assessmentAnswer" value="${index}" ${answers.get(question.position) === index ? "checked" : ""} />
      <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
      <span>${escapeHtml(option)}</span>
    </label>
  `).join("");
  document.querySelector("#previousQuestion").disabled = currentQuestion === 0;
  document.querySelector("#nextQuestion").disabled = currentQuestion === attempt.questions.length - 1;
  document.querySelector("#answerSaveState").textContent = answers.has(question.position) ? "Answer saved." : "Choose the best answer.";
  renderQuestionMap();
}

function renderQuestionMap() {
  questionMap.innerHTML = attempt.questions.map((question, index) => `
    <button type="button" data-question-index="${index}" class="${answers.has(question.position) ? "answered" : ""} ${index === currentQuestion ? "current" : ""}" aria-label="Open question ${question.position}">${question.position}</button>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function saveAnswer(position, selectedOption) {
  answers.set(position, selectedOption);
  renderQuestionMap();
  const saveState = document.querySelector("#answerSaveState");
  saveState.textContent = "Saving…";
  try {
    await apiRequest(`/api/assessment/attempts/${attempt.id}/answers/${position}${courseQuery}`, {
      method: "PUT",
      body: JSON.stringify({ selectedOption })
    });
    saveState.textContent = "Answer saved.";
  } catch (error) {
    saveState.textContent = `Not saved: ${error.message}`;
  }
}

function startTimer() {
  clearInterval(timerHandle);
  updateTimer();
  timerHandle = setInterval(updateTimer, 500);
}

function updateTimer() {
  if (!attempt || !examActive) return;
  const milliseconds = new Date(attempt.expiresAt).getTime() - Date.now();
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = String(seconds % 60).padStart(2, "0");
  document.querySelector("#timerValue").textContent = `${minutesPart}:${secondsPart}`;
  document.querySelector("#timerBox").classList.toggle("urgent", seconds <= 60);
  if (milliseconds <= 0) {
    clearInterval(timerHandle);
    submitAssessment(true);
  }
}

async function submitAssessment(timedOut = false) {
  if (submitting || !attempt) return;
  if (!timedOut) {
    const unanswered = attempt.questionCount - answers.size;
    const message = unanswered > 0
      ? `${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered. Submit anyway?`
      : "Submit your final answers? You cannot change them afterward.";
    if (!window.confirm(message)) return;
  }
  submitting = true;
  document.querySelector("#submitAssessment").disabled = true;
  try {
    const payload = [...answers.entries()].map(([position, selectedOption]) => ({ position, selectedOption }));
    const assessmentResult = await apiRequest(`/api/assessment/attempts/${attempt.id}/submit${courseQuery}`, {
      method: "POST",
      body: JSON.stringify({ answers: payload })
    });
    showResult(assessmentResult);
  } catch (error) {
    document.querySelector("#answerSaveState").textContent = error.message;
    if (timedOut) await refreshAfterEndedAttempt();
  } finally {
    submitting = false;
    document.querySelector("#submitAssessment").disabled = false;
  }
}

async function showResult(outcome) {
  examActive = false;
  clearInterval(timerHandle);
  exam.hidden = true;
  overlay.hidden = true;
  result.hidden = false;
  const passed = outcome.passed;
  const voided = outcome.status === "VOID";
  document.querySelector("#resultMark").textContent = passed ? "✓" : voided ? "!" : "↻";
  document.querySelector("#resultMark").style.background = passed ? "var(--green)" : "var(--orange)";
  document.querySelector("#resultTitle").textContent = passed ? "You passed." : voided ? "Attempt ended." : "Not this time.";
  document.querySelector("#resultScore").textContent = `${outcome.score}/${outcome.total}`;
  document.querySelector("#resultStatus").textContent = passed ? "Certificate assessment passed" : `Passing score: ${outcome.passingScore}/${outcome.total}`;
  document.querySelector("#resultMessage").textContent = passed
    ? "Your result is saved. Return to the course to claim and publish your verified at-a-glance completion certificate."
    : voided
      ? "The third exam-window violation voided this attempt. Review the rules before trying again."
      : `${outcome.timedOut ? "Time expired. " : ""}Review the course topics and try a new randomized question set when you are ready.`;
  document.querySelector("#resultCourseLink").textContent = passed ? "Continue to your certificate ↗" : "Return to the course";
  const retry = document.querySelector("#retryAssessment");
  retry.hidden = passed || outcome.attemptsRemaining <= 0;
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
}

function renderAlreadyPassed() {
  intro.hidden = true;
  exam.hidden = true;
  result.hidden = false;
  document.querySelector("#resultTitle").textContent = "Assessment already passed.";
  document.querySelector("#resultMessage").textContent = "Your passing result is saved. Return to the course to open or publish your certificate.";
  document.querySelector("#resultScore").textContent = "PASSED";
  document.querySelector("#resultStatus").textContent = "Certificate requirement complete";
  document.querySelector("#retryAssessment").hidden = true;
}

async function refreshAfterEndedAttempt() {
  status = await apiRequest(`/api/assessment${courseQuery}`);
  updateCourseUI(status);
  if (status.passed) renderAlreadyPassed();
  else {
    const outcome = {
      passed: false,
      status: "FAILED",
      score: 0,
      total: 15,
      passingScore: 11,
      timedOut: true,
      attemptsRemaining: status.attemptsRemaining
    };
    await showResult(outcome);
  }
}

function updateWarningUI(count) {
  document.querySelector("#warningCount").textContent = `${Math.min(count, 2)} / 2`;
}

async function reportViolation(type) {
  if (!examActive || !attempt || submitting) return;
  const now = Date.now();
  if (violationPending || now - lastViolationAt < 1400) return;
  lastViolationAt = now;
  violationPending = true;
  try {
    const warning = await apiRequest(`/api/assessment/attempts/${attempt.id}/violation${courseQuery}`, {
      method: "POST",
      body: JSON.stringify({ type }),
      keepalive: type === "pagehide"
    });
    attempt.warningCount = warning.warningCount;
    updateWarningUI(warning.warningCount);
    if (warning.terminated) {
      await showResult({
        passed: false,
        status: "VOID",
        score: 0,
        total: 15,
        passingScore: 11,
        timedOut: false,
        attemptsRemaining: Math.max(0, 3 - attempt.attemptNumber)
      });
      return;
    }
    document.querySelector("#violationMessage").textContent = warning.message;
    overlay.hidden = false;
  } catch (error) {
    document.querySelector("#violationMessage").textContent = error.message;
    overlay.hidden = false;
  } finally {
    violationPending = false;
  }
}

async function returnToFullscreen() {
  try {
    await enterFullscreen();
    overlay.hidden = true;
  } catch {
    document.querySelector("#violationMessage").textContent = "Fullscreen permission is required to continue this attempt.";
  }
}

startButton.addEventListener("click", beginAssessment);
document.querySelector("#previousQuestion").addEventListener("click", () => { currentQuestion--; renderQuestion(); });
document.querySelector("#nextQuestion").addEventListener("click", () => { currentQuestion++; renderQuestion(); });
document.querySelector("#submitAssessment").addEventListener("click", () => submitAssessment(false));
document.querySelector("#returnFullscreen").addEventListener("click", returnToFullscreen);
document.querySelector("#retryAssessment").addEventListener("click", async () => {
  result.hidden = true;
  intro.hidden = false;
  status = await apiRequest(`/api/assessment${courseQuery}`);
  updateCourseUI(status);
  startButton.disabled = false;
  startButton.innerHTML = `Begin attempt ${status.attemptsUsed + 1} <span aria-hidden="true">↗</span>`;
});

answerOptions.addEventListener("change", (event) => {
  const input = event.target.closest('input[name="assessmentAnswer"]');
  if (!input) return;
  saveAnswer(attempt.questions[currentQuestion].position, Number(input.value));
});

questionMap.addEventListener("click", (event) => {
  const button = event.target.closest("[data-question-index]");
  if (!button) return;
  currentQuestion = Number(button.dataset.questionIndex);
  renderQuestion();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) reportViolation("visibility");
});
document.addEventListener("fullscreenchange", () => {
  if (examActive && !document.fullscreenElement) reportViolation("fullscreen");
});
window.addEventListener("pagehide", () => reportViolation("pagehide"));

for (const eventName of ["copy", "cut", "contextmenu", "selectstart", "dragstart"]) {
  document.addEventListener(eventName, (event) => {
    if (examActive) event.preventDefault();
  });
}
document.addEventListener("keydown", (event) => {
  if (!examActive || !(event.ctrlKey || event.metaKey)) return;
  if (["a", "c", "x", "p", "s"].includes(event.key.toLowerCase())) event.preventDefault();
});

loadStatus();
