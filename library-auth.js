"use strict";

let libraryAuthMode = "login";

function cookieValue(name) {
  const prefix = name + "=";
  const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

async function libraryApiRequest(url, options = {}) {
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
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }
  return data;
}

function showSignedInStatus(firstName) {
  const accountStatus = document.querySelector("#accountStatus");
  if (!accountStatus) return;
  accountStatus.classList.add("signed-in");
  accountStatus.replaceChildren();
  const dot = document.createElement("i");
  dot.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.textContent = "Welcome back, " + firstName;
  accountStatus.append(dot, label);
}

function ensureAuthDialog() {
  if (document.querySelector("#authDialog")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="auth-dialog" id="authDialog" aria-labelledby="authTitle">
      <div class="auth-shell">
        <aside class="auth-visual" aria-hidden="true">
          <div class="auth-brand-mark">Q</div>
          <p>One account.<br />Every path.</p>
          <div class="auth-code-card">
            <span>progress.save();</span>
            <i></i><i></i><i></i>
          </div>
        </aside>
        <section class="auth-content">
          <button class="dialog-close auth-close" id="authClose" type="button" aria-label="Close account dialog">×</button>
          <p class="auth-eyebrow"><span></span> QuickDevBase account</p>
          <h2 id="authTitle">Welcome back</h2>
          <p class="auth-subtitle" id="authSubtitle">Sign in to sync progress across every technology path.</p>
          <div class="auth-tabs" role="tablist" aria-label="Account action">
            <button class="active" id="loginTab" type="button" role="tab" aria-selected="true" data-auth-mode="login">Sign in</button>
            <button id="registerTab" type="button" role="tab" aria-selected="false" data-auth-mode="register">Create account</button>
          </div>
          <form class="auth-form" id="authForm" novalidate>
            <label id="nameField" hidden>
              <span>Your name</span>
              <input id="authName" name="name" type="text" minlength="2" maxlength="60" autocomplete="name" placeholder="Ada Lovelace" />
            </label>
            <label>
              <span>Email address</span>
              <input id="authEmail" name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@example.com" required />
            </label>
            <label>
              <span>Password</span>
              <input id="authPassword" name="password" type="password" minlength="8" maxlength="128" autocomplete="current-password" placeholder="At least 8 characters" required />
            </label>
            <p class="auth-error" id="authError" role="alert" hidden></p>
            <button class="auth-submit" id="authSubmit" type="submit">
              <span id="authSubmitText">Sign in</span><span aria-hidden="true">→</span>
            </button>
          </form>
          <p class="auth-switch">
            <span id="authSwitchText">New to QuickDevBase?</span>
            <button id="authSwitchButton" type="button">Create an account</button>
          </p>
          <p class="auth-privacy">Your password is salted and hashed. By creating an account, you agree to the <a href="/terms" target="_blank">Terms</a> and acknowledge the <a href="/privacy" target="_blank">Privacy notice</a>.</p>
        </section>
      </div>
    </dialog>
  `);
}

function setLibraryAuthMode(mode) {
  libraryAuthMode = mode === "register" ? "register" : "login";
  const registering = libraryAuthMode === "register";
  const nameField = document.querySelector("#nameField");
  const nameInput = document.querySelector("#authName");
  const passwordInput = document.querySelector("#authPassword");

  document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    const selected = tab.dataset.authMode === libraryAuthMode;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  nameField.hidden = !registering;
  nameInput.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  document.querySelector("#authTitle").textContent = registering ? "Create your account" : "Welcome back";
  document.querySelector("#authSubtitle").textContent = registering
    ? "Save progress across Java, Docker, Python, and AI paths with one QuickDevBase account."
    : "Sign in to sync progress across every technology path.";
  document.querySelector("#authSubmitText").textContent = registering ? "Create account" : "Sign in";
  document.querySelector("#authSwitchText").textContent = registering ? "Already have an account?" : "New to QuickDevBase?";
  document.querySelector("#authSwitchButton").textContent = registering ? "Sign in instead" : "Create an account";
  document.querySelector("#authError").hidden = true;
}

function openLibraryAuth(mode = "login") {
  const authDialog = document.querySelector("#authDialog");
  const authForm = document.querySelector("#authForm");
  authForm.reset();
  setLibraryAuthMode(mode);
  authDialog.showModal();
  document.body.classList.add("dialog-open");
  requestAnimationFrame(() => {
    document.querySelector(libraryAuthMode === "register" ? "#authName" : "#authEmail").focus();
  });
}

function closeLibraryAuth() {
  document.querySelector("#authDialog").close();
  document.body.classList.remove("dialog-open");
}

function wireLibraryAuth(onSignedIn) {
  const authDialog = document.querySelector("#authDialog");
  const authForm = document.querySelector("#authForm");
  const authSubmit = document.querySelector("#authSubmit");
  const authSwitchButton = document.querySelector("#authSwitchButton");

  document.querySelector("#authClose").addEventListener("click", closeLibraryAuth);
  authDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
  authDialog.addEventListener("click", (event) => {
    if (event.target === authDialog) closeLibraryAuth();
  });
  document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    tab.addEventListener("click", () => setLibraryAuthMode(tab.dataset.authMode));
  });
  authSwitchButton.addEventListener("click", () => {
    setLibraryAuthMode(libraryAuthMode === "login" ? "register" : "login");
  });

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorBox = document.querySelector("#authError");
    const name = document.querySelector("#authName").value.trim();
    const email = document.querySelector("#authEmail").value.trim();
    const password = document.querySelector("#authPassword").value;

    if (!authForm.reportValidity()) return;
    errorBox.hidden = true;
    authSubmit.disabled = true;
    document.querySelector("#authSubmitText").textContent = libraryAuthMode === "register" ? "Creating account..." : "Signing in...";

    try {
      const endpoint = libraryAuthMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = libraryAuthMode === "register" ? { name, email, password } : { email, password };
      const data = await libraryApiRequest(endpoint, { method: "POST", body: JSON.stringify(payload) });
      showSignedInStatus(data.user.name.split(" ")[0]);
      closeLibraryAuth();
      if (onSignedIn) await onSignedIn(data.user);
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    } finally {
      authSubmit.disabled = false;
      document.querySelector("#authSubmitText").textContent = libraryAuthMode === "register" ? "Create account" : "Sign in";
    }
  });
}

async function initializeLibraryAuth(onSignedIn) {
  ensureAuthDialog();
  wireLibraryAuth(onSignedIn);

  const loginButton = document.querySelector("#headerLoginButton");
  if (loginButton) {
    loginButton.addEventListener("click", () => openLibraryAuth("login"));
  }

  try {
    const { user } = await libraryApiRequest("/api/auth/me");
    if (!user) return null;
    showSignedInStatus(user.name.split(" ")[0]);
    if (onSignedIn) await onSignedIn(user);
    return user;
  } catch {
    return null;
  }
}
