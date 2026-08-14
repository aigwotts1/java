const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9331);
const profilePath = path.join(process.cwd(), ".browser-qa", String(process.pid));
const screenshots = {
  home: path.join(process.cwd(), "qa-home.png"),
  auth: path.join(process.cwd(), "qa-auth.png"),
  lesson: path.join(process.cwd(), "qa-rest-methods.png"),
  mobile: path.join(process.cwd(), "qa-mobile-rest.png"),
  consent: path.join(process.cwd(), "qa-certificate-consent.png"),
  account: path.join(process.cwd(), "qa-account-privacy.png"),
  celebration: path.join(process.cwd(), "qa-certificate-celebration.png"),
  certificate: path.join(process.cwd(), "qa-certificate-public.png"),
  certificateMobile: path.join(process.cwd(), "qa-certificate-mobile.png"),
  privacyMobile: path.join(process.cwd(), "qa-privacy-mobile.png"),
};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function appRequest(pathname, { method = "GET", body, cookie } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  if (method !== "GET" && method !== "HEAD") headers.Origin = baseUrl;

  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.ok(response.ok, `${method} ${pathname} failed: ${data?.error || response.status}`);
  const setCookie = response.headers.get("set-cookie");
  return { data, cookie: setCookie ? setCookie.split(";", 1)[0] : cookie };
}

async function createNearlyCompleteLearner() {
  const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const name = "Avery Brooks";
  const email = `visual-certificate-${nonce}@example.com`;
  const registration = await appRequest("/api/auth/register", {
    method: "POST",
    body: { name, email, password: "LearnJava!42" },
  });

  for (let moduleId = 1; moduleId <= 17; moduleId += 1) {
    await appRequest(`/api/progress/${moduleId}`, {
      method: "PUT",
      cookie: registration.cookie,
      body: { completed: true },
    });
  }

  return { name, email, cookie: registration.cookie };
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      // Chrome is still starting.
    }
    await delay(200);
  }
  throw new Error("Chrome debugging endpoint did not become ready.");
}

class DevToolsClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", async (event) => {
      const raw = typeof event.data === "string"
        ? event.data
        : Buffer.from(await event.data.arrayBuffer()).toString("utf8");
      const message = JSON.parse(raw);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      this.events.push(message);
    });
    await Promise.race([
      new Promise((resolve, reject) => {
        this.socket.addEventListener("open", resolve, { once: true });
        this.socket.addEventListener("error", reject, { once: true });
      }),
      delay(5000).then(() => {
        throw new Error("Chrome debugging socket did not connect.");
      }),
    ]);
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Chrome command timed out: ${method}`));
      }, 5000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket?.close();
  }
}

async function run() {
  console.log(`Running browser smoke test against ${baseUrl}`);
  await fs.mkdir(profilePath, { recursive: true });
  const certificateLearner = await createNearlyCompleteLearner();

  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debugPort}`,
      "--remote-allow-origins=*",
      `--user-data-dir=${profilePath}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"], windowsHide: true },
  );

  let chromeError = "";
  chrome.stderr.on("data", (chunk) => {
    chromeError += chunk.toString();
  });

  let client;
  try {
    const target = await waitForDebugger();
    client = new DevToolsClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Network.enable");
    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        window.__qaErrors = [];
        window.addEventListener("error", (event) => window.__qaErrors.push(event.message));
        window.addEventListener("unhandledrejection", (event) => window.__qaErrors.push(String(event.reason)));
      `,
    });

    const evaluate = async (expression) => {
      const response = await client.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.text || "Browser evaluation failed.");
      }
      return response.result.value;
    };

    const waitFor = async (expression) => {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
          if (await evaluate(expression)) return;
        } catch {
          // A new document may still be replacing the previous execution context.
        }
        await delay(100);
      }
      throw new Error(`Browser condition timed out: ${expression}`);
    };

    const setViewport = async (width, height, mobile = false) => {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });
    };

    const navigate = async (width, height, mobile = false, expectedAuthLabel = "Sign in") => {
      await setViewport(width, height, mobile);
      await client.send("Page.navigate", { url: baseUrl });
      await waitFor(`document.readyState === "complete" && document.querySelectorAll(".module-card").length === 18`);
      await waitFor(`document.querySelector("#authLabel").textContent.trim() === ${JSON.stringify(expectedAuthLabel)}`);
    };

    const capture = async (filename) => {
      const image = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      await fs.writeFile(filename, Buffer.from(image.data, "base64"));
    };

    await navigate(1440, 1000);
    const desktop = await evaluate(`({
      title: document.title,
      modules: document.querySelectorAll(".module-card").length,
      authLabel: document.querySelector("#authLabel").textContent.trim(),
      errors: window.__qaErrors,
      horizontalScrollPrevented: getComputedStyle(document.body).overflowX === "hidden"
    })`);
    assert.equal(desktop.title, "Java Basecamp — Learn Java, one clear step at a time");
    assert.equal(desktop.modules, 18);
    assert.equal(desktop.authLabel, "Sign in");
    assert.deepEqual(desktop.errors, []);
    assert.equal(desktop.horizontalScrollPrevented, true);
    await capture(screenshots.home);

    await evaluate(`document.querySelector("#authButton").click()`);
    await waitFor(`document.querySelector("#authDialog").open`);
    await evaluate(`document.querySelector("#registerTab").click()`);
    const auth = await evaluate(`(() => {
      const dialog = document.querySelector("#authDialog");
      const bounds = dialog.getBoundingClientRect();
      return {
        open: dialog.open,
        title: document.querySelector("#authTitle").textContent.trim(),
        nameVisible: !document.querySelector("#nameField").hidden,
        insideViewport: bounds.top >= 0 && bounds.left >= 0 && bounds.right <= innerWidth && bounds.bottom <= innerHeight
      };
    })()`);
    assert.equal(auth.open, true);
    assert.equal(auth.title, "Create your account");
    assert.equal(auth.nameVisible, true);
    assert.equal(auth.insideViewport, true);
    await capture(screenshots.auth);

    await evaluate(`document.querySelector("#authClose").click()`);
    await waitFor(`!document.querySelector("#authDialog").open`);
    await evaluate(`document.querySelector('.module-card[data-module-id="6"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    const java8 = await evaluate(`({
      title: document.querySelector("#dialogTitle").textContent.trim(),
      concepts: document.querySelectorAll("#dialogConcepts .concept-item").length,
      hasCompletableFuture: document.querySelector("#dialogConcepts").textContent.includes("CompletableFuture")
    })`);
    assert.equal(java8.title, "Java 8 Features");
    assert.equal(java8.concepts, 12);
    assert.equal(java8.hasCompletableFuture, true);

    await evaluate(`document.querySelector("#dialogClose").click()`);
    await waitFor(`!document.querySelector("#lessonDialog").open`);
    await evaluate(`document.querySelector('.module-card[data-module-id="18"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    const restLesson = await evaluate(`(() => {
      const content = document.querySelector(".dialog-content");
      const before = content.scrollTop;
      const methodLesson = document.querySelectorAll("#dialogConcepts .concept-item")[1];
      methodLesson.open = true;
      const labels = [...methodLesson.querySelectorAll(".concept-snippet > strong")]
        .map((label) => label.textContent.trim());
      const comments = [...methodLesson.querySelectorAll(".snippet-comment")]
        .map((comment) => comment.textContent.trim());
      content.scrollTop = methodLesson.offsetTop - 30;
      return {
        title: document.querySelector("#dialogTitle").textContent.trim(),
        concepts: document.querySelectorAll("#dialogConcepts .concept-item").length,
        hasScrollableContent: content.scrollHeight > content.clientHeight,
        scrolled: content.scrollTop > before,
        overflowY: getComputedStyle(content).overflowY,
        methodLabels: labels,
        commentedExamples: comments.length,
        allCommentsExplainWork: comments.every((comment) => comment.length > 24),
        hasSpringMappings: methodLesson.textContent.includes("@GetMapping") && methodLesson.textContent.includes("@DeleteMapping")
      };
    })()`);
    assert.equal(restLesson.title, "REST APIs with Spring Boot");
    assert.equal(restLesson.concepts, 12);
    assert.equal(restLesson.hasScrollableContent, true);
    assert.equal(restLesson.scrolled, true);
    assert.equal(restLesson.overflowY, "auto");
    assert.deepEqual(restLesson.methodLabels, ["GET", "POST", "PUT", "PATCH", "DELETE"]);
    assert.equal(restLesson.commentedExamples, 5);
    assert.equal(restLesson.allCommentsExplainWork, true);
    assert.equal(restLesson.hasSpringMappings, true);
    await capture(screenshots.lesson);

    await navigate(390, 844, false);
    const mobile = await evaluate(`({
      modules: document.querySelectorAll(".module-card").length,
      horizontalScrollPrevented: getComputedStyle(document.body).overflowX === "hidden"
    })`);
    assert.equal(mobile.modules, 18);
    assert.equal(mobile.horizontalScrollPrevented, true);
    await evaluate(`document.querySelector('.module-card[data-module-id="18"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    const mobileRest = await evaluate(`(() => {
      const dialog = document.querySelector("#lessonDialog");
      const bounds = dialog.getBoundingClientRect();
      const content = document.querySelector(".dialog-content");
      const methodLesson = document.querySelectorAll("#dialogConcepts .concept-item")[1];
      methodLesson.open = true;
      content.scrollTop = methodLesson.offsetTop - 20;
      return {
        width: bounds.width,
        viewportWidth: innerWidth,
        narrowLayoutActive: matchMedia("(max-width: 700px)").matches,
        insideViewport: bounds.left >= 0 && bounds.right <= innerWidth && bounds.top >= 0 && bounds.bottom <= innerHeight,
        scrollable: content.scrollHeight > content.clientHeight,
        methodExamples: methodLesson.querySelectorAll(".concept-snippet").length
      };
    })()`);
    await capture(screenshots.mobile);
    assert.equal(mobileRest.narrowLayoutActive, true);
    assert.ok(mobileRest.width <= mobileRest.viewportWidth);
    assert.equal(mobileRest.insideViewport, true);
    assert.equal(mobileRest.scrollable, true);
    assert.equal(mobileRest.methodExamples, 5);

    const [sessionCookieName, sessionCookieValue] = certificateLearner.cookie.split("=", 2);
    const cookieResult = await client.send("Network.setCookie", {
      name: sessionCookieName,
      value: sessionCookieValue,
      url: baseUrl,
      httpOnly: true,
      sameSite: "Lax",
    });
    assert.equal(cookieResult.success, true);

    await navigate(1440, 1000, false, "Avery");
    await waitFor(`document.querySelector("#progressLabel").textContent.trim() === "17 of 18 complete"`);
    await evaluate(`document.querySelector("#authButton").click()`);
    await waitFor(`!document.querySelector("#userMenu").hidden`);
    await evaluate(`document.querySelector("#accountSettingsButton").click()`);
    await waitFor(`document.querySelector("#accountDialog").open`);
    const accountSettings = await evaluate(`(() => {
      const dialog = document.querySelector("#accountDialog");
      const bounds = dialog.getBoundingClientRect();
      return {
        open: dialog.open,
        name: document.querySelector("#profileName").value,
        hasPrivacyLink: document.querySelector(".account-policy-links").textContent.includes("Privacy notice"),
        deletionExplained: document.querySelector(".danger-zone").textContent.includes("cannot be undone"),
        requiresPassword: document.querySelector("#deletePassword").required,
        requiresDeleteText: document.querySelector("#deleteConfirmation").pattern === "DELETE",
        insideViewport: bounds.left >= 0 && bounds.right <= innerWidth && bounds.top >= 0 && bounds.bottom <= innerHeight
      };
    })()`);
    assert.equal(accountSettings.open, true);
    assert.equal(accountSettings.name, certificateLearner.name);
    assert.equal(accountSettings.hasPrivacyLink, true);
    assert.equal(accountSettings.deletionExplained, true);
    assert.equal(accountSettings.requiresPassword, true);
    assert.equal(accountSettings.requiresDeleteText, true);
    assert.equal(accountSettings.insideViewport, true);
    await capture(screenshots.account);
    await evaluate(`document.querySelector("#accountClose").click()`);
    await waitFor(`!document.querySelector("#accountDialog").open`);
    await evaluate(`document.querySelector('.module-card[data-module-id="18"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    await evaluate(`document.querySelector("#completeButton").click()`);
    await waitFor(`document.querySelector("#certificateDialog").open`);

    const celebration = await evaluate(`(() => {
      const dialog = document.querySelector("#certificateDialog");
      const bounds = dialog.getBoundingClientRect();
      return {
        open: dialog.open,
        title: document.querySelector("#certificateCelebrationTitle").textContent.trim(),
        learnerName: document.querySelector("#certificateLearnerName").textContent.trim(),
        previewName: document.querySelector("#certificatePreviewName").textContent.trim(),
        credentialId: document.querySelector("#certificateCredentialId").textContent.trim(),
        status: document.querySelector("#certificateStatusPill").textContent.trim(),
        claimPanelVisible: !document.querySelector("#certificateClaimPanel").hidden,
        publishedPanelHidden: document.querySelector("#certificatePublishedPanel").hidden,
        consentChecked: document.querySelector("#certificateConsent").checked,
        explainsPublicData: document.querySelector("#certificateClaimPanel").textContent.includes("course title, issue date, credential ID"),
        limitsCredentialClaim: document.querySelector("#certificateClaimPanel").textContent.includes("not professional certification"),
        confettiPieces: document.querySelectorAll(".confetti i").length,
        insideViewport: bounds.left >= 0 && bounds.right <= innerWidth && bounds.top >= 0 && bounds.bottom <= innerHeight,
        errors: window.__qaErrors
      };
    })()`);
    assert.equal(celebration.open, true);
    assert.equal(celebration.title, "You did it. Seriously.");
    assert.equal(celebration.learnerName, certificateLearner.name);
    assert.equal(celebration.previewName, certificateLearner.name);
    assert.equal(celebration.credentialId, "Issued after consent");
    assert.equal(celebration.status, "PRIVATE");
    assert.equal(celebration.claimPanelVisible, true);
    assert.equal(celebration.publishedPanelHidden, true);
    assert.equal(celebration.consentChecked, false);
    assert.equal(celebration.explainsPublicData, true);
    assert.equal(celebration.limitsCredentialClaim, true);
    assert.equal(celebration.confettiPieces, 12);
    assert.equal(celebration.insideViewport, true);
    assert.deepEqual(celebration.errors, []);
    await capture(screenshots.consent);

    await evaluate(`(() => {
      document.querySelector("#certificateConsent").checked = true;
      document.querySelector("#certificateClaimButton").click();
    })()`);
    await waitFor(`!document.querySelector("#certificatePublishedPanel").hidden && document.querySelector("#certificateStatusPill").textContent.trim() === "PUBLIC"`);
    const publishedCertificate = await evaluate(`({
      credentialId: document.querySelector("#certificateCredentialId").textContent.trim(),
      shareUrl: document.querySelector("#certificateViewLink").href,
      linkedinUrl: document.querySelector("#certificateLinkedInLink").href,
      claimPanelHidden: document.querySelector("#certificateClaimPanel").hidden,
      publicNote: document.querySelector(".certificate-public-note").textContent.trim(),
      errors: window.__qaErrors
    })`);
    assert.match(publishedCertificate.credentialId, /^JBC-[A-Z0-9_-]{10}$/);
    assert.match(publishedCertificate.shareUrl, /\/certificate\/[A-Za-z0-9_-]{24}$/);
    assert.ok(publishedCertificate.linkedinUrl.includes(encodeURIComponent(publishedCertificate.shareUrl)));
    assert.equal(publishedCertificate.claimPanelHidden, true);
    assert.ok(publishedCertificate.publicNote.includes("email stays private"));
    assert.deepEqual(publishedCertificate.errors, []);
    await capture(screenshots.celebration);

    await setViewport(1440, 1000, false);
    await client.send("Page.navigate", { url: publishedCertificate.shareUrl });
    await waitFor(`document.readyState === "complete" && document.querySelector(".certificate")`);
    const publicCertificate = await evaluate(`(() => {
      const certificate = document.querySelector(".certificate");
      const bounds = certificate.getBoundingClientRect();
      const hash = document.querySelector(".verification-strip code").textContent.trim();
      return {
        title: document.title,
        learnerName: document.querySelector(".certificate-body h2").textContent.trim(),
        verified: document.querySelector(".verification-strip strong").textContent.trim(),
        hash,
        linkedinUrl: document.querySelector(".linkedin-button").href,
        containsPrivateEmail: document.documentElement.textContent.includes(${JSON.stringify(certificateLearner.email)}),
        fitsViewport: bounds.left >= 0 && bounds.right <= innerWidth,
        errors: window.__qaErrors
      };
    })()`);
    assert.ok(publicCertificate.title.includes("Verified Certificate"));
    assert.equal(publicCertificate.learnerName, certificateLearner.name);
    assert.equal(publicCertificate.verified, "Publicly verified");
    assert.match(publicCertificate.hash, /^[a-f0-9]{64}$/);
    assert.ok(publicCertificate.linkedinUrl.includes(encodeURIComponent(publishedCertificate.shareUrl)));
    assert.equal(publicCertificate.containsPrivateEmail, false);
    assert.equal(publicCertificate.fitsViewport, true);
    assert.deepEqual(publicCertificate.errors, []);
    await capture(screenshots.certificate);

    await setViewport(390, 844, false);
    await client.send("Page.reload");
    await waitFor(`document.readyState === "complete" && document.querySelector(".certificate")`);
    const mobileCertificate = await evaluate(`(() => {
      const certificate = document.querySelector(".certificate");
      const bounds = certificate.getBoundingClientRect();
      return {
        narrowLayoutActive: matchMedia("(max-width: 620px)").matches,
        fitsViewport: bounds.left >= 0 && bounds.right <= innerWidth,
        actionsVisible: document.querySelector(".certificate-nav").getBoundingClientRect().bottom <= innerHeight,
        noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
        learnerName: document.querySelector(".certificate-body h2").textContent.trim()
      };
    })()`);
    assert.equal(mobileCertificate.narrowLayoutActive, true);
    assert.equal(mobileCertificate.fitsViewport, true);
    assert.equal(mobileCertificate.actionsVisible, true);
    assert.equal(mobileCertificate.noHorizontalOverflow, true);
    assert.equal(mobileCertificate.learnerName, certificateLearner.name);
    await capture(screenshots.certificateMobile);

    await client.send("Page.navigate", { url: `${baseUrl}/privacy` });
    await waitFor(`document.readyState === "complete" && document.querySelector(".legal-page h1")`);
    const privacyPage = await evaluate(`({
      title: document.querySelector(".legal-page h1").textContent.trim(),
      consentPromise: document.querySelector(".notice").textContent.includes("does not automatically make your information public"),
      accountDeletion: document.documentElement.textContent.includes("permanently delete your account"),
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(privacyPage.title, "Privacy notice");
    assert.equal(privacyPage.consentPromise, true);
    assert.equal(privacyPage.accountDeletion, true);
    assert.equal(privacyPage.noHorizontalOverflow, true);
    assert.deepEqual(privacyPage.errors, []);
    await capture(screenshots.privacyMobile);

    console.log("Browser smoke test passed.");
    console.log(JSON.stringify({ desktop, auth, java8, restLesson, mobile, mobileRest, accountSettings, celebration, publishedCertificate, publicCertificate, mobileCertificate, privacyPage, screenshots }, null, 2));
  } finally {
    client?.close();
    chrome.kill();
    const meaningfulChromeErrors = chromeError
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("DevTools listening on"));
    if (meaningfulChromeErrors.length && process.exitCode) {
      console.error(meaningfulChromeErrors.join("\n"));
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
