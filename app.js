const aiPathCourseKey = location.pathname === "/ai/rag"
  ? "rag"
  : location.pathname === "/ai/agents"
    ? "agentic-ai"
    : location.pathname === "/ai/generative-ai"
      ? "generative-ai"
      : null;
const suppliedCourse = (aiPathCourseKey && window.QUICKDEV_AI_COURSES?.[aiPathCourseKey]) || window.QUICKDEV_COURSE;
const courseConfig = suppliedCourse;
if (!courseConfig) throw new Error("Course content is unavailable.");
const modules = courseConfig.modules;
const quickNotes = courseConfig.quickNotes;
const groupedExamples = courseConfig.groupedExamples || {};
const exampleComments = courseConfig.exampleComments || {};
const stageLabels = courseConfig.stageLabels;
const courseQuery = `?course=${encodeURIComponent(courseConfig.key)}`;

const cardThemes = [
  { accent: "#e65e39", soft: "rgba(230,94,57,.10)", bg: "#fbf4ea", edge: "#ddcdbd" },
  { accent: "#2458a6", soft: "rgba(36,88,166,.10)", bg: "#f2f5f7", edge: "#cbd5df" },
  { accent: "#3f7554", soft: "rgba(63,117,84,.10)", bg: "#f2f6ef", edge: "#cbd8c6" },
  { accent: "#a7608b", soft: "rgba(167,96,139,.10)", bg: "#f8f1f5", edge: "#ddcad5" }
];

const grid = document.querySelector("#moduleGrid");
const searchInput = document.querySelector("#searchInput");
const filterGroup = document.querySelector("#filterGroup");
const emptyState = document.querySelector("#emptyState");
const clearSearch = document.querySelector("#clearSearch");
const dialog = document.querySelector("#lessonDialog");
const closeDialog = document.querySelector("#dialogClose");
const completeButton = document.querySelector("#completeButton");
const resumeButton = document.querySelector("#resumeButton");
const progressButton = document.querySelector("#progressButton");
const toast = document.querySelector("#toast");
const authDialog = document.querySelector("#authDialog");
const authButton = document.querySelector("#authButton");
const authClose = document.querySelector("#authClose");
const authForm = document.querySelector("#authForm");
const authSubmit = document.querySelector("#authSubmit");
const authSwitchButton = document.querySelector("#authSwitchButton");
const userMenu = document.querySelector("#userMenu");
const logoutButton = document.querySelector("#logoutButton");
const accountSettingsButton = document.querySelector("#accountSettingsButton");
const accountDialog = document.querySelector("#accountDialog");
const accountClose = document.querySelector("#accountClose");
const profileForm = document.querySelector("#profileForm");
const deleteAccountForm = document.querySelector("#deleteAccountForm");
const certificateMenuButton = document.querySelector("#certificateMenuButton");
const certificateDialog = document.querySelector("#certificateDialog");
const certificateClose = document.querySelector("#certificateClose");
const certificateCopyButton = document.querySelector("#certificateCopyButton");
const certificateClaimButton = document.querySelector("#certificateClaimButton");
const certificateUnpublishButton = document.querySelector("#certificateUnpublishButton");
const certificateSaveNameButton = document.querySelector("#certificateSaveNameButton");
const certificatePublicName = document.querySelector("#certificatePublicName");
const certificateConsent = document.querySelector("#certificateConsent");
const aiGuideStatus = document.querySelector("#aiGuideStatus");
const aiGuideStatusText = document.querySelector("#aiGuideStatusText");
const aiGuideLogin = document.querySelector("#aiGuideLogin");
const aiQuestionForm = document.querySelector("#aiQuestionForm");
const aiQuestionInput = document.querySelector("#aiQuestion");
const aiQuestionSubmit = document.querySelector("#aiQuestionSubmit");
const aiGuideAnswer = document.querySelector("#aiGuideAnswer");
const aiGuideAnswerText = document.querySelector("#aiGuideAnswerText");
const aiGuideAnswerMeta = document.querySelector("#aiGuideAnswerMeta");

let activeFilter = "all";
let activeModuleId = null;
let completed = new Set();
let currentUser = null;
let currentCertificate = null;
let certificateEligible = false;
let assessmentRequired = false;
let assessmentUrl = `/assessment${courseQuery}`;
let certificateConsentVersion = null;
let authMode = "login";
let isSavingProgress = false;
let toastTimer;
let aiStatus = null;
let isAskingAi = false;

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
  const csrfToken = needsCsrf ? cookieValue("XSRF-TOKEN") : null;
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
      ...options.headers
    }
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function moduleSearchText(module) {
  return [module.title, module.shortTitle, module.description, ...module.topics].join(" ").toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || courseConfig.name.slice(0, 1).toUpperCase();
}

function applyCourseUI() {
  document.documentElement.dataset.course = courseConfig.key;
  document.querySelectorAll("[data-course-name]").forEach((element) => { element.textContent = courseConfig.name; });
  document.querySelectorAll("[data-course-module-count]").forEach((element) => { element.textContent = modules.length; });
  const conceptCount = modules.reduce((total, module) => total + module.topics.length, 0);
  document.querySelectorAll("[data-course-concept-count]").forEach((element) => { element.textContent = conceptCount; });
  document.querySelectorAll("[data-course-mark]").forEach((element) => { element.textContent = courseConfig.mark || courseConfig.name[0]; });
  if (courseConfig.pageTitle) document.title = courseConfig.pageTitle;
  if (courseConfig.pageDescription) document.querySelector('meta[name="description"]')?.setAttribute("content", courseConfig.pageDescription);
  if (courseConfig.heroEyebrow) document.querySelector(".hero-copy .eyebrow").innerHTML = `<span></span> ${courseConfig.heroEyebrow}`;
  if (courseConfig.heroTitle) document.querySelector(".hero-copy h1").innerHTML = courseConfig.heroTitle;
  if (courseConfig.heroLede) document.querySelector(".hero-lede").textContent = courseConfig.heroLede;
  if (courseConfig.previewLabel) document.querySelector(".card-topline > span:last-child").textContent = courseConfig.previewLabel;
  if (courseConfig.previewCode) document.querySelector(".code-preview").innerHTML = courseConfig.previewCode;
  if (courseConfig.chipOne) document.querySelector(".chip-one").textContent = courseConfig.chipOne;
  if (courseConfig.chipTwo) document.querySelector(".chip-two").textContent = courseConfig.chipTwo;
  if (courseConfig.curriculumTitle) document.querySelector(".section-heading h2").textContent = courseConfig.curriculumTitle;
  if (courseConfig.curriculumLede) document.querySelector(".section-heading > div > p:last-child").textContent = courseConfig.curriculumLede;
  if (courseConfig.searchPlaceholder) searchInput.placeholder = courseConfig.searchPlaceholder;
  document.querySelector(".cup-body span").textContent = courseConfig.mark || courseConfig.name[0];
  document.querySelector(".auth-brand-mark").textContent = "Q";
  if (courseConfig.certificateTitleHtml) document.querySelector(".certificate-preview-card > p").innerHTML = courseConfig.certificateTitleHtml;
  if (courseConfig.completionNoun) {
    document.querySelector("#certificateLearnerName").parentElement.innerHTML = `<strong id="certificateLearnerName">${escapeHtml(courseConfig.completionNoun)}</strong>, you reviewed every topic and passed the QuickDevBase.in ${escapeHtml(courseConfig.name)} at-a-glance assessment. That took consistency, curiosity, and a lot of tiny wins.`;
  }
  if (courseConfig.trademark) document.querySelector(".footer-copy small").textContent = courseConfig.trademark;
  if (courseConfig.hubPath) {
    const libraryLink = document.querySelector('.main-nav a[href="/"]');
    if (libraryLink) {
      libraryLink.href = courseConfig.hubPath;
      libraryLink.textContent = courseConfig.hubLabel || "Path hub";
    }
  }
  filterGroup.innerHTML = [
    '<button class="filter active" type="button" data-filter="all">All <span>' + modules.length + '</span></button>',
    ...Object.entries(stageLabels).map(([key, label]) =>
      '<button class="filter" type="button" data-filter="' + escapeHtml(key) + '">' + escapeHtml(label) + '</button>'
    )
  ].join("");
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
  const registering = authMode === "register";
  const nameField = document.querySelector("#nameField");
  const nameInput = document.querySelector("#authName");
  const passwordInput = document.querySelector("#authPassword");

  document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    const selected = tab.dataset.authMode === authMode;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  nameField.hidden = !registering;
  nameInput.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  document.querySelector("#authTitle").textContent = registering ? "Create your account" : "Welcome back";
  document.querySelector("#authSubtitle").textContent = registering
    ? `Save every completed ${courseConfig.name} module to your QuickDevBase profile.`
    : `Sign in to continue your ${courseConfig.name} path from any device.`;
  document.querySelector("#authSubmitText").textContent = registering ? "Create account" : "Sign in";
  document.querySelector("#authSwitchText").textContent = registering ? "Already have an account?" : "New to QuickDevBase?";
  authSwitchButton.textContent = registering ? "Sign in instead" : "Create an account";
  document.querySelector("#authError").hidden = true;
}

function openAuth(mode = "login", message = "") {
  if (dialog.open) closeLesson();
  userMenu.hidden = true;
  authButton.setAttribute("aria-expanded", "false");
  authForm.reset();
  setAuthMode(mode);
  if (message) document.querySelector("#authSubtitle").textContent = message;
  authDialog.showModal();
  document.body.classList.add("dialog-open");
  requestAnimationFrame(() => document.querySelector(registeringSelector()).focus());
}

function registeringSelector() {
  return authMode === "register" ? "#authName" : "#authEmail";
}

function closeAuth() {
  authDialog.close();
  document.body.classList.remove("dialog-open");
}

function updateAuthUI() {
  const loggedIn = Boolean(currentUser);
  authButton.classList.toggle("is-user", loggedIn);
  authButton.setAttribute("aria-label", loggedIn ? `Open account menu for ${currentUser.name}` : "Sign in or create an account");
  document.querySelector("#authAvatar").textContent = loggedIn ? initials(currentUser.name) : "→";
  document.querySelector("#authLabel").textContent = loggedIn ? currentUser.name.split(" ")[0] : "Sign in";
  document.querySelector("#headerProgressCaption").textContent = currentCertificate?.isPublic
    ? "Certificate published"
    : certificateEligible
      ? currentCertificate ? "Certificate private" : "Certificate ready"
      : assessmentRequired ? "Assessment ready"
      : loggedIn ? "Synced progress" : "Sign in to save";
  document.querySelector("#progressOwnerLabel").textContent = loggedIn ? `${currentUser.name}'s course progress` : "Sign in to save your progress";
  certificateMenuButton.hidden = !(certificateEligible || assessmentRequired);
  document.querySelector("#certificateMenuLabel").textContent = currentCertificate?.isPublic
    ? "View certificate"
    : currentCertificate ? "Republish certificate" : assessmentRequired ? "Take certificate test" : "Claim certificate";

  if (loggedIn) {
    document.querySelector("#userMenuName").textContent = currentUser.name;
    document.querySelector("#userMenuEmail").textContent = currentUser.email;
  } else {
    userMenu.hidden = true;
    authButton.setAttribute("aria-expanded", "false");
  }
}

async function loadUserProgress() {
  if (!currentUser) {
    completed = new Set();
    return;
  }
  const data = await apiRequest(`/api/progress${courseQuery}`);
  completed = new Set(data.completed);
}

async function loadCertificate() {
  if (!currentUser) {
    currentCertificate = null;
    certificateEligible = false;
    assessmentRequired = false;
    certificateConsentVersion = null;
    return null;
  }

  const status = await apiRequest(`/api/certificate${courseQuery}`);
  currentCertificate = status.certificate;
  certificateEligible = status.eligible;
  assessmentRequired = status.modulesComplete && !status.assessmentPassed;
  assessmentUrl = status.assessmentUrl || `/assessment${courseQuery}`;
  certificateConsentVersion = status.consentVersion;
  return status;
}

function showCertificateCelebration(certificate = currentCertificate) {
  if (!certificateEligible) return;
  if (certificate) currentCertificate = certificate;
  if (dialog.open) closeLesson();
  if (authDialog.open) closeAuth();
  if (accountDialog.open) closeAccountSettings();
  userMenu.hidden = true;
  authButton.setAttribute("aria-expanded", "false");

  const publicName = currentCertificate?.name || currentUser.name;
  const isPublic = Boolean(currentCertificate?.isPublic);
  document.querySelector("#certificateLearnerName").textContent = publicName;
  document.querySelector("#certificatePreviewName").textContent = publicName;
  certificatePublicName.value = publicName;
  document.querySelector("#certificateCredentialId").textContent = currentCertificate?.credentialId || "Issued after consent";
  document.querySelector("#certificateStatusPill").textContent = isPublic ? "PUBLIC" : "PRIVATE";
  document.querySelector("#certificateClaimPanel").hidden = isPublic;
  document.querySelector("#certificatePublishedPanel").hidden = !isPublic;
  document.querySelector("#certificateError").hidden = true;
  certificateConsent.checked = false;
  certificateClaimButton.innerHTML = `${currentCertificate ? "Republish" : "Claim &amp; publish"} certificate <span aria-hidden="true">↗</span>`;

  if (isPublic) {
    document.querySelector("#certificateViewLink").href = currentCertificate.shareUrl;
    document.querySelector("#certificateLinkedInLink").href = currentCertificate.linkedInShareUrl;
  }
  if (!certificateDialog.open) certificateDialog.showModal();
  document.body.classList.add("dialog-open");
  updateAuthUI();
}

function closeCertificateCelebration() {
  certificateDialog.close();
  document.body.classList.remove("dialog-open");
}

async function copyPublicCertificateLink() {
  if (!currentCertificate?.isPublic) return;
  try {
    await navigator.clipboard.writeText(currentCertificate.shareUrl);
  } catch {
    const input = document.createElement("textarea");
    input.value = currentCertificate.shareUrl;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  showToastMessage("Certificate link copied", "Anyone with the link can verify your achievement.", "◆");
}

async function saveDisplayName(name) {
  const data = await apiRequest("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({ name })
  });
  currentUser = data.user;
  if (currentCertificate) currentCertificate = { ...currentCertificate, name: currentUser.name };
  updateAuthUI();
  document.querySelector("#certificateLearnerName").textContent = currentUser.name;
  document.querySelector("#certificatePreviewName").textContent = currentUser.name;
  certificatePublicName.value = currentUser.name;
  return data.user;
}

async function claimCertificate() {
  const errorBox = document.querySelector("#certificateError");
  const publicName = certificatePublicName.value.trim();
  errorBox.hidden = true;

  if (!certificatePublicName.reportValidity()) return;
  if (!certificateConsent.checked) {
    errorBox.textContent = "Check the consent box before publishing your certificate.";
    errorBox.hidden = false;
    return;
  }

  certificateClaimButton.disabled = true;
  certificateClaimButton.textContent = "Publishing safely...";
  try {
    const data = await apiRequest(`/api/certificate/claim${courseQuery}`, {
      method: "POST",
      body: JSON.stringify({
        consent: true,
        consentVersion: certificateConsentVersion,
        publicName
      })
    });
    currentUser = data.user;
    currentCertificate = data.certificate;
    certificateEligible = true;
    showCertificateCelebration(currentCertificate);
    showToastMessage(
      data.newlyIssued ? "Certificate earned" : "Certificate republished",
      "Public verification is active and your email remains private.",
      "◆"
    );
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    certificateClaimButton.disabled = false;
    certificateClaimButton.innerHTML = `${currentCertificate ? "Republish" : "Claim &amp; publish"} certificate <span aria-hidden="true">↗</span>`;
  }
}

async function unpublishCertificate() {
  if (!currentCertificate?.isPublic) return;
  const confirmed = window.confirm("Make this certificate private? Its public link will stop working until you republish it.");
  if (!confirmed) return;

  certificateUnpublishButton.disabled = true;
  try {
    const data = await apiRequest(`/api/certificate/publication${courseQuery}`, { method: "DELETE" });
    currentCertificate = data.certificate;
    showCertificateCelebration(currentCertificate);
    showToastMessage("Certificate is private", "The public verification link is now disabled.", "◇");
  } catch (error) {
    showToastMessage("Privacy update failed", error.message, "!");
  } finally {
    certificateUnpublishButton.disabled = false;
  }
}

async function saveCertificateName() {
  if (!certificatePublicName.reportValidity()) return;
  certificateSaveNameButton.disabled = true;
  try {
    await saveDisplayName(certificatePublicName.value.trim());
    showToastMessage("Certificate name updated", "The public verification page now shows the corrected name.");
  } catch (error) {
    showToastMessage("Name not updated", error.message, "!");
  } finally {
    certificateSaveNameButton.disabled = false;
  }
}

function openAccountSettings() {
  if (!currentUser) return;
  userMenu.hidden = true;
  authButton.setAttribute("aria-expanded", "false");
  document.querySelector("#profileName").value = currentUser.name;
  document.querySelector("#profileMessage").hidden = true;
  deleteAccountForm.reset();
  document.querySelector("#deleteAccountError").hidden = true;
  accountDialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeAccountSettings() {
  accountDialog.close();
  document.body.classList.remove("dialog-open");
}

async function initializeSession() {
  try {
    const data = await apiRequest("/api/auth/me");
    currentUser = data.user;
    await loadUserProgress();
    await loadCertificate();
  } catch (error) {
    currentUser = null;
    completed = new Set();
    currentCertificate = null;
    certificateEligible = false;
    assessmentRequired = false;
    showToastMessage("Offline progress unavailable", "Sign in will be available when the server reconnects.", "!");
  } finally {
    updateAuthUI();
    updateProgress();
    renderModules();
  }
}

function conceptLessons(module) {
  const notes = quickNotes[module.id] || [];

  return module.topics.map((topic, index) => {
    const [plain, code] = notes[index] || [
      courseConfig.fallbackNote,
      courseConfig.fallbackCode
    ];
    const examples = groupedExamples[topic] || [["Example", code]];

    return `
      <details class="concept-item" ${index === 0 ? "open" : ""}>
        <summary>
          <span class="concept-index">${formatNumber(index + 1)}</span>
          <span class="concept-copy">
            <strong>${escapeHtml(topic)}</strong>
            <small>${escapeHtml(plain)}</small>
          </span>
          <span class="concept-chevron" aria-hidden="true">+</span>
        </summary>
        <div class="concept-example">
          <span>${examples.length > 1 ? "tiny examples for each" : "tiny example"}</span>
          <div class="concept-snippet-grid">
            ${examples.map(([label, snippet]) => `
              <section class="concept-snippet">
                <strong>${escapeHtml(label)}</strong>
                <p class="snippet-comment"><span aria-hidden="true">//</span> ${escapeHtml(exampleComments[label] || plain)}</p>
                <pre><code>${escapeHtml(snippet)}</code></pre>
              </section>
            `).join("")}
          </div>
        </div>
      </details>
    `;
  }).join("");
}

function moduleCard(module) {
  const theme = cardThemes[(module.id - 1) % cardThemes.length];
  const isComplete = completed.has(module.id);
  const previewTopics = module.topics.slice(0, 3);
  const remaining = module.topics.length - previewTopics.length;

  return `
    <article
      class="module-card${isComplete ? " is-complete" : ""}"
      style="--card-accent:${theme.accent};--card-accent-soft:${theme.soft};--card-bg:${theme.bg};--card-edge:${theme.edge}"
      data-module-id="${module.id}"
      data-testid="module-${module.id}"
      role="button"
      tabindex="0"
      aria-label="Open module ${module.id}: ${module.title}"
    >
      <div class="module-top">
        <span class="module-number">${isComplete ? "✓" : formatNumber(module.id)}</span>
        <span class="module-state"><i></i>${isComplete ? "Complete" : stageLabels[module.stage]}</span>
      </div>
      <h3>${module.shortTitle || module.title}</h3>
      <p>${module.description}</p>
      <div class="topic-preview">
        ${previewTopics.map((topic) => `<span>${topic}</span>`).join("")}
        ${remaining > 0 ? `<span>+${remaining} more</span>` : ""}
      </div>
      <div class="module-footer">
        <span>${module.topics.length} concepts</span>
        <span>${isComplete ? "Review module ↗" : "Explore module ↗"}</span>
      </div>
    </article>
  `;
}

function renderModules() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = modules.filter((module) => {
    const matchesStage = activeFilter === "all" || module.stage === activeFilter;
    const matchesQuery = !query || moduleSearchText(module).includes(query);
    return matchesStage && matchesQuery;
  });

  grid.innerHTML = filtered.map(moduleCard).join("");
  emptyState.hidden = filtered.length > 0;
  grid.hidden = filtered.length === 0;

  grid.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", () => openModule(Number(card.dataset.moduleId)));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModule(Number(card.dataset.moduleId));
      }
    });
  });
}

function updateProgress() {
  const count = completed.size;
  const percent = Math.round((count / modules.length) * 100);
  document.querySelector("#progressBar").style.width = `${percent}%`;
  document.querySelector("#progressLabel").textContent = `${count} of ${modules.length} complete`;
  document.querySelector("#headerProgress").textContent = `${percent}%`;
  document.querySelector("#miniProgress").textContent = count;
  document.querySelector(".mini-ring").style.setProperty("--ring-progress", `${percent}%`);
}

function openModule(id) {
  const module = modules.find((item) => item.id === id);
  if (!module) return;

  activeModuleId = id;
  document.querySelector("#dialogIndex").textContent = formatNumber(module.id);
  document.querySelector("#dialogStage").textContent = stageLabels[module.stage];
  document.querySelector("#dialogTitle").textContent = module.title;
  document.querySelector("#dialogDescription").textContent = module.description;
  document.querySelector("#dialogConcepts").innerHTML = conceptLessons(module);
  document.querySelector("#dialogChallenge").textContent = module.challenge;
  const officialLink = document.querySelector("#dialogOfficialLink");
  if (officialLink) {
    officialLink.href = module.officialUrl;
    officialLink.querySelector("span").textContent = module.officialLabel || `Official ${courseConfig.name} documentation`;
  }
  updateCompleteButton();
  resetAiGuide();

  dialog.showModal();
  document.body.classList.add("dialog-open");
  loadAiStatus();
}

function openRequestedModule() {
  const params = new URLSearchParams(location.search);
  const moduleId = Number(params.get("module"));
  if (!Number.isInteger(moduleId) || !modules.some((module) => module.id === moduleId)) return;

  openModule(moduleId);
  const requestedTopic = params.get("topic");
  if (!requestedTopic) return;
  const conceptItems = [...document.querySelectorAll("#dialogConcepts .concept-item")];
  const matched = conceptItems.find((item) => item.querySelector("summary strong")?.textContent === requestedTopic);
  if (!matched) return;
  conceptItems.forEach((item) => { item.open = item === matched; });
  requestAnimationFrame(() => matched.scrollIntoView({ behavior: "smooth", block: "center" }));
}

function activeModule() {
  return modules.find((module) => module.id === activeModuleId) || null;
}

function lessonContext(module) {
  const notes = quickNotes[module.id] || [];
  const topicText = module.topics.map((topic, index) => {
    const [plain, fallbackCode] = notes[index] || [courseConfig.fallbackNote, courseConfig.fallbackCode];
    const examples = groupedExamples[topic] || [["Example", fallbackCode]];
    const exampleText = examples.map(([label, code]) =>
      `${label}: ${exampleComments[label] || plain}\n${code}`
    ).join("\n");
    return `${index + 1}. ${topic}\n${plain}\n${exampleText}`;
  }).join("\n\n");
  return `Module summary: ${module.description}\n\nTopics and examples:\n${topicText}\n\nTiny challenge: ${module.challenge}`.slice(0, 16000);
}

function setAiControlsDisabled(disabled) {
  document.querySelectorAll("[data-ai-mode]").forEach((button) => { button.disabled = disabled; });
  aiQuestionInput.disabled = disabled;
  aiQuestionSubmit.disabled = disabled;
}

function resetAiGuide() {
  aiStatus = null;
  isAskingAi = false;
  aiQuestionForm.reset();
  aiGuideAnswer.hidden = true;
  aiGuideAnswerText.textContent = "";
  aiGuideAnswerMeta.textContent = "";
  aiGuideStatus.className = "ai-guide-status";
  if (!currentUser) {
    aiGuideStatusText.textContent = "Sign in to use the AI lesson guide.";
    aiGuideLogin.hidden = false;
    setAiControlsDisabled(true);
  } else {
    aiGuideStatusText.textContent = "Checking AI guide availability...";
    aiGuideLogin.hidden = true;
    setAiControlsDisabled(true);
  }
}

async function loadAiStatus() {
  if (!currentUser || !dialog.open) return;
  try {
    aiStatus = await apiRequest("/api/ai/status");
    if (!dialog.open) return;
    aiGuideStatus.className = `ai-guide-status ${aiStatus.enabled ? "ready" : "error"}`;
    aiGuideStatusText.textContent = aiStatus.enabled
      ? `${aiStatus.remainingToday} of ${aiStatus.dailyLimit} AI requests left today.`
      : "AI guide is not configured on this server yet.";
    setAiControlsDisabled(!aiStatus.enabled);
  } catch (error) {
    if (!dialog.open) return;
    if (error.status === 401) {
      currentUser = null;
      updateAuthUI();
      resetAiGuide();
      return;
    }
    aiGuideStatus.className = "ai-guide-status error";
    aiGuideStatusText.textContent = error.message;
    setAiControlsDisabled(true);
  }
}

async function askQuickDev(mode, question = "") {
  if (!currentUser) {
    openAuth("login", "Sign in to use Ask QuickDev with a safe daily allowance.");
    return;
  }
  const module = activeModule();
  if (!module || isAskingAi || !aiStatus?.enabled) return;

  isAskingAi = true;
  setAiControlsDisabled(true);
  aiGuideStatus.className = "ai-guide-status busy";
  aiGuideStatusText.textContent = "Building a short, lesson-grounded answer...";
  aiGuideAnswer.hidden = true;

  try {
    const result = await apiRequest("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify({
        course: courseConfig.key,
        moduleId: module.id,
        moduleTitle: module.title,
        mode,
        question,
        context: lessonContext(module),
        officialUrl: module.officialUrl
      })
    });
    aiStatus.remainingToday = result.remainingToday;
    aiGuideAnswerText.textContent = result.answer;
    aiGuideAnswerMeta.textContent = result.cached
      ? `Cached answer · ${result.remainingToday} left`
      : `${result.remainingToday} left today`;
    aiGuideAnswer.hidden = false;
    aiGuideStatus.className = "ai-guide-status ready";
    aiGuideStatusText.textContent = `${result.remainingToday} of ${aiStatus.dailyLimit} AI requests left today.`;
  } catch (error) {
    aiGuideStatus.className = "ai-guide-status error";
    aiGuideStatusText.textContent = error.message;
    if (error.status === 401) {
      currentUser = null;
      updateAuthUI();
      aiGuideLogin.hidden = false;
    }
  } finally {
    isAskingAi = false;
    setAiControlsDisabled(!currentUser || !aiStatus?.enabled);
  }
}

function updateCompleteButton() {
  const isComplete = completed.has(activeModuleId);
  completeButton.classList.toggle("completed", isComplete);
  completeButton.disabled = isSavingProgress;
  document.querySelector("#completeButtonText").textContent = isSavingProgress
    ? "Saving your progress..."
    : !currentUser
      ? "Sign in to save progress"
      : isComplete
        ? "Completed — mark as not done"
        : "Mark module complete";
}

function showToastMessage(title, message, icon = "✓") {
  toast.querySelector(":scope > span").textContent = icon;
  toast.querySelector("strong").textContent = title;
  toast.querySelector("small").textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function showToast(isComplete) {
  showToastMessage(
    isComplete ? "Module complete" : "Progress updated",
    isComplete ? "Nice work — saved to your account." : "This module is back on your path."
  );
}

async function toggleComplete() {
  if (!activeModuleId) return;
  if (!currentUser) {
    openAuth("register", "Create an account or sign in to save this module to your learning profile.");
    return;
  }
  if (isSavingProgress) return;

  const wasComplete = completed.has(activeModuleId);
  const moduleId = activeModuleId;
  if (wasComplete) completed.delete(activeModuleId);
  else completed.add(activeModuleId);
  isSavingProgress = true;
  updateCompleteButton();
  updateProgress();
  renderModules();

  try {
    const result = await apiRequest(`/api/progress/${moduleId}${courseQuery}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !wasComplete })
    });
    if (result.certificate) currentCertificate = result.certificate;
    certificateEligible = result.certificateEligible;
    assessmentRequired = result.modulesComplete && !result.assessmentPassed;
    assessmentUrl = result.assessmentUrl || `/assessment${courseQuery}`;
    certificateConsentVersion = result.consentVersion;
    updateAuthUI();
    if (!wasComplete && certificateEligible && !currentCertificate?.isPublic) showCertificateCelebration(currentCertificate);
    else if (!wasComplete && assessmentRequired) showToastMessage("Course review complete", "Take the 15-question assessment to unlock your certificate.", "◆");
    else showToast(!wasComplete);
  } catch (error) {
    if (wasComplete) completed.add(moduleId);
    else completed.delete(moduleId);
    if (error.status === 401) {
      currentUser = null;
      updateAuthUI();
      showToastMessage("Session expired", "Sign in again to save your progress.", "!");
    } else {
      showToastMessage("Progress not saved", error.message, "!");
    }
    updateProgress();
    renderModules();
  } finally {
    isSavingProgress = false;
    updateCompleteButton();
  }
}

function closeLesson() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}

searchInput.addEventListener("input", renderModules);

filterGroup.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-filter]");
  if (!filter) return;
  activeFilter = filter.dataset.filter;
  filterGroup.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item === filter));
  renderModules();
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  activeFilter = "all";
  filterGroup.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
  renderModules();
  searchInput.focus();
});

closeDialog.addEventListener("click", closeLesson);
completeButton.addEventListener("click", toggleComplete);
aiGuideLogin.addEventListener("click", () => openAuth("login", "Sign in to use Ask QuickDev with a safe daily allowance."));
document.querySelectorAll("[data-ai-mode]").forEach((button) => {
  button.addEventListener("click", () => askQuickDev(button.dataset.aiMode));
});
aiQuestionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!aiQuestionForm.reportValidity()) return;
  askQuickDev("ask", aiQuestionInput.value.trim());
});
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeLesson();
});

authButton.addEventListener("click", () => {
  if (!currentUser) {
    openAuth("login");
    return;
  }
  userMenu.hidden = !userMenu.hidden;
  authButton.setAttribute("aria-expanded", String(!userMenu.hidden));
});

authClose.addEventListener("click", closeAuth);
authDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
authDialog.addEventListener("click", (event) => {
  if (event.target === authDialog) closeAuth();
});

certificateClose.addEventListener("click", closeCertificateCelebration);
certificateDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
certificateDialog.addEventListener("click", (event) => {
  if (event.target === certificateDialog) closeCertificateCelebration();
});
certificateCopyButton.addEventListener("click", copyPublicCertificateLink);
certificateClaimButton.addEventListener("click", claimCertificate);
certificateUnpublishButton.addEventListener("click", unpublishCertificate);
certificateSaveNameButton.addEventListener("click", saveCertificateName);
certificateMenuButton.addEventListener("click", () => {
  if (assessmentRequired && !certificateEligible) {
    location.href = assessmentUrl;
    return;
  }
  showCertificateCelebration();
});
certificatePublicName.addEventListener("input", () => {
  document.querySelector("#certificatePreviewName").textContent = certificatePublicName.value.trim() || "Your name";
});

accountSettingsButton.addEventListener("click", openAccountSettings);
accountClose.addEventListener("click", closeAccountSettings);
accountDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
accountDialog.addEventListener("click", (event) => {
  if (event.target === accountDialog) closeAccountSettings();
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.querySelector("#profileSaveButton");
  const message = document.querySelector("#profileMessage");
  if (!profileForm.reportValidity()) return;
  button.disabled = true;
  message.hidden = true;
  try {
    await saveDisplayName(document.querySelector("#profileName").value.trim());
    message.textContent = "Your display name has been updated.";
    message.classList.remove("error");
    message.hidden = false;
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("error");
    message.hidden = false;
  } finally {
    button.disabled = false;
  }
});

deleteAccountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.querySelector("#deleteAccountButton");
  const errorBox = document.querySelector("#deleteAccountError");
  if (!deleteAccountForm.reportValidity()) return;
  button.disabled = true;
  errorBox.hidden = true;
  try {
    await apiRequest("/api/account", {
      method: "DELETE",
      body: JSON.stringify({
        password: document.querySelector("#deletePassword").value,
        confirmation: document.querySelector("#deleteConfirmation").value
      })
    });
    closeAccountSettings();
    currentUser = null;
    completed = new Set();
    currentCertificate = null;
    certificateEligible = false;
    assessmentRequired = false;
    certificateConsentVersion = null;
    updateAuthUI();
    updateProgress();
    renderModules();
    showToastMessage("Account deleted", "Your profile, progress, sessions, and certificate were permanently removed.", "✓");
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    button.disabled = false;
  }
});

document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
});

authSwitchButton.addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorBox = document.querySelector("#authError");
  const name = document.querySelector("#authName").value.trim();
  const email = document.querySelector("#authEmail").value.trim();
  const password = document.querySelector("#authPassword").value;

  if (!authForm.reportValidity()) return;
  errorBox.hidden = true;
  authSubmit.disabled = true;
  document.querySelector("#authSubmitText").textContent = authMode === "register" ? "Creating account..." : "Signing in...";

  try {
    const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload = authMode === "register" ? { name, email, password } : { email, password };
    const data = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(payload) });
    currentUser = data.user;
    await loadUserProgress();
    await loadCertificate();
    updateAuthUI();
    updateProgress();
    renderModules();
    closeAuth();
    showToastMessage(
      authMode === "register" ? "Account ready" : "Welcome back",
      `Your progress is now synced as ${currentUser.name}.`
    );
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    authSubmit.disabled = false;
    document.querySelector("#authSubmitText").textContent = authMode === "register" ? "Create account" : "Sign in";
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
    // Clear the local identity even if the expired session is already gone.
  } finally {
    currentUser = null;
    completed = new Set();
    currentCertificate = null;
    certificateEligible = false;
    assessmentRequired = false;
    certificateConsentVersion = null;
    userMenu.hidden = true;
    logoutButton.disabled = false;
    updateAuthUI();
    updateProgress();
    renderModules();
    showToastMessage("Signed out", "Your saved progress stays safely in your account.", "↪");
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".auth-area")) {
    userMenu.hidden = true;
    authButton.setAttribute("aria-expanded", "false");
  }
});

resumeButton.addEventListener("click", () => {
  const nextModule = modules.find((module) => !completed.has(module.id)) || modules[0];
  openModule(nextModule.id);
});

progressButton.addEventListener("click", () => {
  document.querySelector("#curriculum").scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA";
  if (event.key === "/" && !isTyping && !dialog.open) {
    event.preventDefault();
    searchInput.focus();
  }
});

const navLinks = [...document.querySelectorAll(".main-nav a")];
const observedSections = [...document.querySelectorAll("#roadmap, #curriculum, #about")];

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    },
    { rootMargin: "-25% 0px -60%", threshold: [0, 0.2, 0.5] }
  );
  observedSections.forEach((section) => observer.observe(section));
}

applyCourseUI();
renderModules();
updateProgress();
updateAuthUI();
initializeSession().finally(() => {
  if (new URLSearchParams(location.search).get("assessment") === "passed" && certificateEligible && !currentCertificate?.isPublic) {
    showCertificateCelebration(currentCertificate);
  }
  openRequestedModule();
});
