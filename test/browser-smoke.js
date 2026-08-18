const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9331);
const profilePath = path.join(process.cwd(), ".browser-qa", String(process.pid));
const screenshots = {
  library: path.join(process.cwd(), "qa-quickdev-home.png"),
  team: path.join(process.cwd(), "qa-quickdev-team.png"),
  brandFooter: path.join(process.cwd(), "qa-quickdev-footer.png"),
  libraryMobile: path.join(process.cwd(), "qa-quickdev-mobile.png"),
  libraryMobileDeck: path.join(process.cwd(), "qa-quickdev-mobile-deck.png"),
  teamMobile: path.join(process.cwd(), "qa-quickdev-team-mobile.png"),
  aiHub: path.join(process.cwd(), "qa-ai-hub.png"),
  aiHubMobile: path.join(process.cwd(), "qa-ai-hub-mobile.png"),
  generativeAi: path.join(process.cwd(), "qa-generative-ai.png"),
  rag: path.join(process.cwd(), "qa-rag.png"),
  ragMobileDialog: path.join(process.cwd(), "qa-rag-mobile-dialog.png"),
  agenticAi: path.join(process.cwd(), "qa-agentic-ai.png"),
  agentLesson: path.join(process.cwd(), "qa-agent-security.png"),
  home: path.join(process.cwd(), "qa-java-home.png"),
  docker: path.join(process.cwd(), "qa-docker-home.png"),
  dockerMobile: path.join(process.cwd(), "qa-docker-mobile.png"),
  dockerLesson: path.join(process.cwd(), "qa-docker-compose.png"),
  python: path.join(process.cwd(), "qa-python-home.png"),
  pythonMobile: path.join(process.cwd(), "qa-python-mobile.png"),
  pythonLesson: path.join(process.cwd(), "qa-python-rest.png"),
  auth: path.join(process.cwd(), "qa-auth.png"),
  lesson: path.join(process.cwd(), "qa-rest-methods.png"),
  mobile: path.join(process.cwd(), "qa-mobile-rest.png"),
  aiGuide: path.join(process.cwd(), "qa-ai-guide.png"),
  aiGuideMobile: path.join(process.cwd(), "qa-ai-guide-mobile.png"),
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

function cookieMap(cookie = "") {
  return new Map(cookie.split(/;\s*/).filter(Boolean).map((entry) => {
    const separator = entry.indexOf("=");
    return [entry.slice(0, separator), entry.slice(separator + 1)];
  }));
}

function responseCookies(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}

function mergeCookies(existing, setCookies) {
  const jar = cookieMap(existing);
  for (const setCookie of setCookies) {
    const [pair] = setCookie.split(";", 1);
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    if (/max-age=0/i.test(setCookie)) jar.delete(name);
    else jar.set(name, value);
  }
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function appRequest(pathname, { method = "GET", body, cookie, csrf = true } = {}) {
  let activeCookie = cookie || "";
  const unsafe = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  if (unsafe && csrf && !cookieMap(activeCookie).has("XSRF-TOKEN")) {
    activeCookie = (await appRequest("/api/auth/me", { cookie: activeCookie, csrf: false })).cookie;
  }
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (activeCookie) headers.Cookie = activeCookie;
  if (unsafe) {
    headers.Origin = baseUrl;
    const csrfToken = cookieMap(activeCookie).get("XSRF-TOKEN");
    if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.ok(response.ok, `${method} ${pathname} failed: ${data?.error || response.status}`);
  const setCookies = responseCookies(response.headers);
  return { data, cookie: mergeCookies(activeCookie, setCookies) };
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

    const navigate = async (width, height, mobile = false, expectedAuthLabel = "Sign in", pathname = "/java", expectedModules = 18) => {
      await setViewport(width, height, mobile);
      await client.send("Page.navigate", { url: `${baseUrl}${pathname}` });
      await waitFor(`document.readyState === "complete" && document.querySelectorAll(".module-card").length === ${expectedModules}`);
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

    await setViewport(1440, 1000, false);
    await client.send("Page.navigate", { url: baseUrl });
    await waitFor(`document.readyState === "complete" && document.querySelectorAll("[data-course-card]").length === 4`);
    const library = await evaluate(`({
      title: document.title,
      technologyCards: document.querySelectorAll("[data-course-card]").length,
      javaPath: document.querySelector('[data-course-card="java"]').getAttribute("href"),
      dockerPath: document.querySelector('[data-course-card="docker"]').getAttribute("href"),
      pythonPath: document.querySelector('[data-course-card="python"]').getAttribute("href"),
      aiPath: document.querySelector('[data-course-card="ai"]').getAttribute("href"),
      brandLogos: document.querySelectorAll(".brand-logo").length,
      logosLoaded: [...document.querySelectorAll(".brand-logo")].every((logo) => logo.complete && logo.naturalWidth > 0),
      logoPath: new URL(document.querySelector(".brand-logo").src).pathname,
      faviconPath: new URL(document.querySelector('link[rel="icon"]').href).pathname,
      teamPath: document.querySelector('footer a[href="/team"]').getAttribute("href"),
      footerLinkColors: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).color),
      footerLinkDecorations: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).textDecorationLine),
      founderOnHomepage: Boolean(document.querySelector("#founderName")),
      taglineVisible: document.documentElement.textContent.includes("Developer knowledge, at a glance"),
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(library.title, "QuickDevBase — Developer Knowledge, At a Glance");
    assert.equal(library.technologyCards, 4);
    assert.equal(library.javaPath, "/java");
    assert.equal(library.dockerPath, "/docker");
    assert.equal(library.pythonPath, "/python");
    assert.equal(library.aiPath, "/ai");
    assert.equal(library.brandLogos, 2);
    assert.equal(library.logosLoaded, true);
    assert.equal(library.logoPath, "/quickdevbase-logo.png");
    assert.equal(library.faviconPath, "/quickdevbase-logo.png");
    assert.equal(library.teamPath, "/team");
    assert.deepEqual([...new Set(library.footerLinkColors)], ["rgb(36, 88, 166)"]);
    assert.deepEqual([...new Set(library.footerLinkDecorations)], ["none"]);
    assert.equal(library.founderOnHomepage, false);
    assert.equal(library.taglineVisible, true);
    assert.equal(library.noHorizontalOverflow, true);
    assert.deepEqual(library.errors, []);
    await capture(screenshots.library);
    await evaluate(`document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, document.documentElement.scrollHeight)`);
    await delay(150);
    await capture(screenshots.brandFooter);

    await client.send("Page.navigate", { url: `${baseUrl}/team` });
    await waitFor(`document.readyState === "complete" && document.querySelector("#founderName")`);
    const teamDesktop = await evaluate(`(() => {
      const section = document.querySelector("#teamProfile");
      const portrait = section.querySelector("img");
      const bounds = section.getBoundingClientRect();
      return {
        title: document.title,
        founderName: document.querySelector("#founderName").textContent.trim(),
        linkedinUrl: section.querySelector('.founder-connect[href*="linkedin.com"]').getAttribute("href"),
        portfolioUrl: section.querySelector('.founder-connect[href*="github.io/portfolio"]').getAttribute("href"),
        founderEmail: section.querySelector('.founder-connect[href^="mailto:"]').getAttribute("href"),
        footerLinkColors: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).color),
        footerLinkDecorations: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).textDecorationLine),
        visible: bounds.bottom > 0 && bounds.top < innerHeight,
        portraitLoaded: portrait.complete && portrait.naturalWidth > 0,
        emailVisible: section.querySelector('.founder-connect[href^="mailto:"]').getBoundingClientRect().bottom <= innerHeight,
        noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth
      };
    })()`);
    assert.equal(teamDesktop.title, "Team | QuickDevBase");
    assert.equal(teamDesktop.founderName, "Abhinav Vashishth");
    assert.equal(teamDesktop.linkedinUrl, "https://www.linkedin.com/in/abhinavvashishth/");
    assert.equal(teamDesktop.portfolioUrl, "https://aigwotts1.github.io/portfolio/");
    assert.equal(teamDesktop.founderEmail, "mailto:vashishthabhinav9@gmail.com");
    assert.deepEqual([...new Set(teamDesktop.footerLinkColors)], ["rgb(36, 88, 166)"]);
    assert.deepEqual([...new Set(teamDesktop.footerLinkDecorations)], ["none"]);
    assert.equal(teamDesktop.visible, true);
    assert.equal(teamDesktop.portraitLoaded, true);
    assert.equal(teamDesktop.emailVisible, true);
    assert.equal(teamDesktop.noHorizontalOverflow, true);
    await capture(screenshots.team);

    await setViewport(390, 844, false);
    await client.send("Page.navigate", { url: baseUrl });
    await waitFor(`document.readyState === "complete" && document.querySelectorAll("[data-course-card]").length === 4`);
    const libraryMobile = await evaluate(`({
      cards: document.querySelectorAll("[data-course-card]").length,
      responsiveLayout: matchMedia("(max-width: 680px)").matches,
      logoLoaded: document.querySelector("header .brand-logo").complete && document.querySelector("header .brand-logo").naturalWidth > 0,
      logoWidth: document.querySelector("header .brand-logo").getBoundingClientRect().width,
      proofUsesThreeColumns: getComputedStyle(document.querySelector(".trust-line")).gridTemplateColumns.split(" ").length === 3,
      compactDeck: document.querySelector(".hero-visual").getBoundingClientRect().height <= 410,
      deckFits: (() => {
        const visual = document.querySelector(".hero-visual").getBoundingClientRect();
        const deck = document.querySelector(".knowledge-stack").getBoundingClientRect();
        return deck.left >= visual.left && deck.right <= visual.right;
      })(),
      notesFit: (() => {
        const visual = document.querySelector(".hero-visual").getBoundingClientRect();
        return [...document.querySelectorAll(".floating-note")].every((note) => {
          const bounds = note.getBoundingClientRect();
          return bounds.left >= visual.left && bounds.right <= visual.right && bounds.top >= visual.top && bounds.bottom <= visual.bottom;
        });
      })(),
      conceptBadgeClearsCardCopy: (() => {
        const badge = document.querySelector(".note-one").getBoundingClientRect();
        return [...document.querySelectorAll(".stack-card-java strong, .stack-card-java small")].every((copy) => {
          const bounds = copy.getBoundingClientRect();
          return badge.right <= bounds.left || badge.left >= bounds.right || badge.bottom <= bounds.top || badge.top >= bounds.bottom;
        });
      })(),
      horizontalScrollPrevented: getComputedStyle(document.body).overflowX === "hidden",
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(libraryMobile.cards, 4);
    assert.equal(libraryMobile.responsiveLayout, true);
    assert.equal(libraryMobile.logoLoaded, true);
    assert.ok(libraryMobile.logoWidth <= 56);
    assert.equal(libraryMobile.proofUsesThreeColumns, true);
    assert.equal(libraryMobile.compactDeck, true);
    assert.equal(libraryMobile.deckFits, true, JSON.stringify(libraryMobile));
    assert.equal(libraryMobile.notesFit, true, JSON.stringify(libraryMobile));
    assert.equal(libraryMobile.conceptBadgeClearsCardCopy, true, JSON.stringify(libraryMobile));
    assert.equal(libraryMobile.horizontalScrollPrevented, true);
    assert.equal(libraryMobile.noHorizontalOverflow, true, JSON.stringify(libraryMobile));
    assert.deepEqual(libraryMobile.errors, []);
    await capture(screenshots.libraryMobile);
    await evaluate(`scrollTo(0, document.querySelector(".hero-visual").offsetTop - 150)`);
    await delay(150);
    await capture(screenshots.libraryMobileDeck);

    const libraryResponsiveWidths = [];
    for (const width of [320, 500]) {
      await setViewport(width, 844, false);
      await client.send("Page.navigate", { url: baseUrl });
      await waitFor(`document.readyState === "complete" && document.querySelectorAll("[data-course-card]").length === 4`);
      const metrics = await evaluate(`(() => {
        const visual = document.querySelector(".hero-visual").getBoundingClientRect();
        const notes = [...document.querySelectorAll(".floating-note")].map((item) => item.getBoundingClientRect());
        const cards = [...document.querySelectorAll(".stack-card")].map((item) => item.getBoundingClientRect());
        const badge = document.querySelector(".note-one").getBoundingClientRect();
        const copy = [...document.querySelectorAll(".stack-card-java strong, .stack-card-java small")]
          .map((item) => item.getBoundingClientRect());
        const inside = (bounds) => bounds.left >= visual.left && bounds.right <= visual.right
          && bounds.top >= visual.top && bounds.bottom <= visual.bottom;
        const separate = (first, second) => first.right <= second.left || first.left >= second.right
          || first.bottom <= second.top || first.top >= second.bottom;
        return {
          viewportWidth: innerWidth,
          proofColumns: getComputedStyle(document.querySelector(".trust-line")).gridTemplateColumns.split(" ").length,
          compactDeck: visual.height <= 410,
          cardsFit: cards.every(inside),
          notesFit: notes.every(inside),
          conceptBadgeClearsCardCopy: copy.every((bounds) => separate(badge, bounds)),
          noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
          errors: window.__qaErrors
        };
      })()`);
      libraryResponsiveWidths.push(metrics);
    }
    for (const metrics of libraryResponsiveWidths) {
      assert.equal(metrics.proofColumns, 3, JSON.stringify(metrics));
      assert.equal(metrics.compactDeck, true, JSON.stringify(metrics));
      assert.equal(metrics.cardsFit, true, JSON.stringify(metrics));
      assert.equal(metrics.notesFit, true, JSON.stringify(metrics));
      assert.equal(metrics.conceptBadgeClearsCardCopy, true, JSON.stringify(metrics));
      assert.equal(metrics.noHorizontalOverflow, true, JSON.stringify(metrics));
      assert.deepEqual(metrics.errors, []);
    }
    await setViewport(390, 844, false);

    await client.send("Page.navigate", { url: `${baseUrl}/team` });
    await waitFor(`document.readyState === "complete" && document.querySelector("#founderName")`);
    const teamMobile = await evaluate(`(() => {
      const section = document.querySelector("#teamProfile");
      const portrait = section.querySelector("img").getBoundingClientRect();
      const bounds = section.getBoundingClientRect();
      return {
        narrowLayout: matchMedia("(max-width: 680px)").matches,
        portraitInsideSection: portrait.left >= bounds.left && portrait.right <= bounds.right,
        emailMatches: section.querySelector('.founder-connect[href^="mailto:"]').getAttribute("href") === "mailto:vashishthabhinav9@gmail.com",
        linkedinMatches: section.querySelector('.founder-connect[href*="linkedin.com"]').getAttribute("href") === "https://www.linkedin.com/in/abhinavvashishth/",
        portfolioMatches: section.querySelector('.founder-connect[href*="github.io/portfolio"]').getAttribute("href") === "https://aigwotts1.github.io/portfolio/",
        viewportWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
        errors: window.__qaErrors
      };
    })()`);
    assert.equal(teamMobile.narrowLayout, true);
    assert.equal(teamMobile.portraitInsideSection, true);
    assert.equal(teamMobile.emailMatches, true);
    assert.equal(teamMobile.linkedinMatches, true);
    assert.equal(teamMobile.portfolioMatches, true);
    assert.equal(teamMobile.noHorizontalOverflow, true, JSON.stringify(teamMobile));
    assert.deepEqual(teamMobile.errors, []);
    await capture(screenshots.teamMobile);

    await navigate(1440, 1000);
    const desktop = await evaluate(`({
      title: document.title,
      modules: document.querySelectorAll(".module-card").length,
      authLabel: document.querySelector("#authLabel").textContent.trim(),
      brandLogos: document.querySelectorAll(".brand-logo").length,
      logosLoaded: [...document.querySelectorAll(".brand-logo")].every((logo) => logo.complete && logo.naturalWidth > 0),
      footerLinkColors: [...document.querySelectorAll(".footer-links a")].map((link) => getComputedStyle(link).color),
      footerLinkDecorations: [...document.querySelectorAll(".footer-links a")].map((link) => getComputedStyle(link).textDecorationLine),
      errors: window.__qaErrors,
      horizontalScrollPrevented: getComputedStyle(document.body).overflowX === "hidden"
    })`);
    assert.equal(desktop.title, "Java at a Glance | QuickDevBase");
    assert.equal(desktop.modules, 18);
    assert.equal(desktop.authLabel, "Sign in");
    assert.equal(desktop.brandLogos, 2);
    assert.equal(desktop.logosLoaded, true);
    assert.deepEqual([...new Set(desktop.footerLinkColors)], ["rgb(36, 88, 166)"]);
    assert.deepEqual([...new Set(desktop.footerLinkDecorations)], ["none"]);
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
    const modernJava = await evaluate(`({
      title: document.querySelector("#dialogTitle").textContent.trim(),
      concepts: document.querySelectorAll("#dialogConcepts .concept-item").length,
      hasCompletableFuture: document.querySelector("#dialogConcepts").textContent.includes("CompletableFuture"),
      hasJava11: document.querySelector("#dialogConcepts").textContent.includes("Java 11: HTTP Client"),
      hasJava17: document.querySelector("#dialogConcepts").textContent.includes("Sealed classes (Java 17)"),
      hasJava21: document.querySelector("#dialogConcepts").textContent.includes("Virtual threads (Java 21)"),
      marksPreview: document.querySelector("#dialogConcepts").textContent.includes("Java 21 preview")
    })`);
    assert.equal(modernJava.title, "Modern Java: 8, 11, 17 & 21");
    assert.equal(modernJava.concepts, 26);
    assert.equal(modernJava.hasCompletableFuture, true);
    assert.equal(modernJava.hasJava11, true);
    assert.equal(modernJava.hasJava17, true);
    assert.equal(modernJava.hasJava21, true);
    assert.equal(modernJava.marksPreview, true);

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
        hasSpringMappings: methodLesson.textContent.includes("@GetMapping") && methodLesson.textContent.includes("@DeleteMapping"),
        aiTitle: document.querySelector("#aiGuideTitle").textContent.trim(),
        aiSignInVisible: !document.querySelector("#aiGuideLogin").hidden,
        aiPresetButtonsDisabled: [...document.querySelectorAll("[data-ai-mode]")].every((button) => button.disabled),
        aiAnswerHidden: document.querySelector("#aiGuideAnswer").hidden,
        aiStatus: document.querySelector("#aiGuideStatusText").textContent.trim()
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
    assert.equal(restLesson.aiTitle, "Ask QuickDev");
    assert.equal(restLesson.aiSignInVisible, true);
    assert.equal(restLesson.aiPresetButtonsDisabled, true);
    assert.equal(restLesson.aiAnswerHidden, true);
    assert.match(restLesson.aiStatus, /Sign in/);
    await capture(screenshots.lesson);
    await evaluate(`document.querySelector(".dialog-content").scrollTop = document.querySelector("#aiGuideTitle").offsetTop - 50`);
    await delay(100);
    await capture(screenshots.aiGuide);

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
      const aiBlock = document.querySelector(".ai-guide-block");
      methodLesson.open = true;
      content.scrollTop = aiBlock.offsetTop - 20;
      const aiBounds = aiBlock.getBoundingClientRect();
      const contentBounds = content.getBoundingClientRect();
      return {
        width: bounds.width,
        viewportWidth: innerWidth,
        narrowLayoutActive: matchMedia("(max-width: 700px)").matches,
        insideViewport: bounds.left >= 0 && bounds.right <= innerWidth && bounds.top >= 0 && bounds.bottom <= innerHeight,
        scrollable: content.scrollHeight > content.clientHeight,
        methodExamples: methodLesson.querySelectorAll(".concept-snippet").length,
        aiInsideContent: aiBounds.left >= contentBounds.left && aiBounds.right <= contentBounds.right,
        aiButtonsStacked: getComputedStyle(document.querySelector(".ai-guide-actions")).gridTemplateColumns.split(" ").length === 1,
        aiQuestionButtonFullWidth: Math.abs(document.querySelector("#aiQuestionSubmit").getBoundingClientRect().width - document.querySelector("#aiQuestionForm > div").getBoundingClientRect().width) < 2
      };
    })()`);
    await capture(screenshots.aiGuideMobile);
    assert.equal(mobileRest.narrowLayoutActive, true);
    assert.ok(mobileRest.width <= mobileRest.viewportWidth);
    assert.equal(mobileRest.insideViewport, true);
    assert.equal(mobileRest.scrollable, true);
    assert.equal(mobileRest.methodExamples, 5);
    assert.equal(mobileRest.aiInsideContent, true);
    assert.equal(mobileRest.aiButtonsStacked, true);
    assert.equal(mobileRest.aiQuestionButtonFullWidth, true);

    await navigate(1440, 1000, false, "Sign in", "/docker");
    const docker = await evaluate(`({
      title: document.title,
      modules: document.querySelectorAll(".module-card").length,
      concepts: [...document.querySelectorAll(".module-footer > span:first-child")]
        .reduce((total, item) => total + Number.parseInt(item.textContent, 10), 0),
      searchPlaceholder: document.querySelector("#searchInput").placeholder,
      hasCompose: document.documentElement.textContent.includes("Docker Compose"),
      brandLogos: document.querySelectorAll(".brand-logo").length,
      logosLoaded: [...document.querySelectorAll(".brand-logo")].every((logo) => logo.complete && logo.naturalWidth > 0),
      footerLinkColors: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).color),
      footerLinkDecorations: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).textDecorationLine),
      brandAccent: getComputedStyle(document.querySelector(".brand-muted")).color,
      avatarColor: getComputedStyle(document.querySelector(".auth-avatar")).backgroundColor,
      navigationAccent: getComputedStyle(document.querySelector(".main-nav .active"), "::after").backgroundColor,
      errors: window.__qaErrors,
      horizontalScrollPrevented: getComputedStyle(document.body).overflowX === "hidden"
    })`);
    assert.equal(docker.title, "Docker at a Glance | QuickDevBase");
    assert.equal(docker.modules, 18);
    assert.equal(docker.concepts, 126);
    assert.equal(docker.searchPlaceholder, "Search topics, e.g. volumes");
    assert.equal(docker.hasCompose, true);
    assert.equal(docker.brandLogos, 2);
    assert.equal(docker.logosLoaded, true);
    assert.deepEqual([...new Set(docker.footerLinkColors)], ["rgb(36, 88, 166)"]);
    assert.deepEqual([...new Set(docker.footerLinkDecorations)], ["none"]);
    assert.equal(docker.brandAccent, "rgb(21, 95, 194)");
    assert.equal(docker.avatarColor, "rgb(22, 132, 194)");
    assert.equal(docker.navigationAccent, "rgb(22, 132, 194)");
    assert.equal(docker.horizontalScrollPrevented, true);
    assert.deepEqual(docker.errors, []);
    await capture(screenshots.docker);

    await navigate(390, 844, false, "Sign in", "/docker");
    const dockerMobile = await evaluate(`({
      responsiveLayout: matchMedia("(max-width: 700px)").matches,
      logoLoaded: document.querySelector(".site-header .brand-logo").complete && document.querySelector(".site-header .brand-logo").naturalWidth > 0,
      logoPath: new URL(document.querySelector(".site-header .brand-logo").src).pathname,
      brandAccent: getComputedStyle(document.querySelector(".brand-muted")).color,
      avatarColor: getComputedStyle(document.querySelector(".auth-avatar")).backgroundColor,
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(dockerMobile.responsiveLayout, true);
    assert.equal(dockerMobile.logoLoaded, true);
    assert.equal(dockerMobile.logoPath, "/quickdevbase-logo.png");
    assert.equal(dockerMobile.brandAccent, "rgb(21, 95, 194)");
    assert.equal(dockerMobile.avatarColor, "rgb(22, 132, 194)");
    assert.equal(dockerMobile.noHorizontalOverflow, true);
    assert.deepEqual(dockerMobile.errors, []);
    await capture(screenshots.dockerMobile);

    await navigate(1440, 1000, false, "Sign in", "/docker");
    await evaluate(`document.querySelector('.module-card[data-module-id="11"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    const dockerLesson = await evaluate(`(() => {
      const content = document.querySelector(".dialog-content");
      content.scrollTop = content.scrollHeight;
      const official = document.querySelector("#dialogOfficialLink");
      return {
        title: document.querySelector("#dialogTitle").textContent.trim(),
        concepts: document.querySelectorAll("#dialogConcepts .concept-item").length,
        officialUrl: official.href,
        officialLabel: official.textContent.trim(),
        scrollable: content.scrollHeight > content.clientHeight,
        overflowY: getComputedStyle(content).overflowY
      };
    })()`);
    assert.equal(dockerLesson.title, "Docker Compose");
    assert.equal(dockerLesson.concepts, 7);
    assert.match(dockerLesson.officialUrl, /^https:\/\/docs\.docker\.com\/compose\/?$/);
    assert.ok(dockerLesson.officialLabel.includes("Official Docker documentation"));
    assert.equal(dockerLesson.scrollable, true);
    assert.equal(dockerLesson.overflowY, "auto");
    await capture(screenshots.dockerLesson);

    await navigate(1440, 1000, false, "Sign in", "/python");
    const python = await evaluate(`({
      title: document.title,
      modules: document.querySelectorAll(".module-card").length,
      concepts: [...document.querySelectorAll(".module-footer > span:first-child")]
        .reduce((total, item) => total + Number.parseInt(item.textContent, 10), 0),
      searchPlaceholder: document.querySelector("#searchInput").placeholder,
      hasAsyncio: document.documentElement.textContent.includes("Concurrency & Asyncio"),
      hasProtocols: document.documentElement.textContent.includes("Python's Object Protocols"),
      avatarColor: getComputedStyle(document.querySelector(".auth-avatar")).backgroundColor,
      navigationAccent: getComputedStyle(document.querySelector(".main-nav .active"), "::after").backgroundColor,
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(python.title, "Python at a Glance | QuickDevBase");
    assert.equal(python.modules, 18);
    assert.equal(python.concepts, 126);
    assert.equal(python.searchPlaceholder, "Search topics, e.g. generators");
    assert.equal(python.hasAsyncio, true);
    assert.equal(python.hasProtocols, true);
    assert.equal(python.avatarColor, "rgb(55, 118, 171)");
    assert.equal(python.navigationAccent, "rgb(55, 118, 171)");
    assert.equal(python.noHorizontalOverflow, true);
    assert.deepEqual(python.errors, []);
    await capture(screenshots.python);

    await navigate(390, 844, false, "Sign in", "/python");
    const pythonMobile = await evaluate(`({
      responsiveLayout: matchMedia("(max-width: 700px)").matches,
      logoLoaded: document.querySelector(".site-header .brand-logo").complete && document.querySelector(".site-header .brand-logo").naturalWidth > 0,
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(pythonMobile.responsiveLayout, true);
    assert.equal(pythonMobile.logoLoaded, true);
    assert.equal(pythonMobile.noHorizontalOverflow, true);
    assert.deepEqual(pythonMobile.errors, []);
    await capture(screenshots.pythonMobile);

    await navigate(1440, 1000, false, "Sign in", "/python");
    await evaluate(`document.querySelector('.module-card[data-module-id="17"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    const pythonLesson = await evaluate(`(() => {
      const content = document.querySelector(".dialog-content");
      const methodLesson = [...document.querySelectorAll("#dialogConcepts .concept-item")]
        .find((item) => item.textContent.includes("REST methods: GET, POST, PUT, PATCH & DELETE"));
      methodLesson.open = true;
      content.scrollTop = methodLesson.offsetTop - 20;
      const official = document.querySelector("#dialogOfficialLink");
      return {
        title: document.querySelector("#dialogTitle").textContent.trim(),
        concepts: document.querySelectorAll("#dialogConcepts .concept-item").length,
        methodExamples: methodLesson.querySelectorAll(".concept-snippet").length,
        allExamplesCommented: [...methodLesson.querySelectorAll(".concept-snippet")]
          .every((item) => item.querySelector(".snippet-comment").textContent.trim().length > 3),
        officialUrl: official.href,
        scrollable: content.scrollHeight > content.clientHeight,
        overflowY: getComputedStyle(content).overflowY
      };
    })()`);
    assert.equal(pythonLesson.title, "HTTP, APIs & Networking");
    assert.equal(pythonLesson.concepts, 7);
    assert.equal(pythonLesson.methodExamples, 5);
    assert.equal(pythonLesson.allExamplesCommented, true);
    assert.match(pythonLesson.officialUrl, /^https:\/\/docs\.python\.org\/3\/library\/internet\.html$/);
    assert.equal(pythonLesson.scrollable, true);
    assert.equal(pythonLesson.overflowY, "auto");
    await capture(screenshots.pythonLesson);

    await setViewport(1440, 1000, false);
    await client.send("Page.navigate", { url: `${baseUrl}/ai` });
    await waitFor(`document.readyState === "complete" && document.querySelectorAll("[data-ai-path]").length === 3`);
    const aiHub = await evaluate(`({
      title: document.title,
      paths: document.querySelectorAll("[data-ai-path]").length,
      genPath: document.querySelector('[data-ai-path="generative-ai"]').getAttribute("href"),
      ragPath: document.querySelector('[data-ai-path="rag"]').getAttribute("href"),
      agentPath: document.querySelector('[data-ai-path="agentic-ai"]').getAttribute("href"),
      hasSequence: document.querySelector("#routeMap").textContent.includes("First, understand generation"),
      brandLogos: document.querySelectorAll(".brand-logo").length,
      logosLoaded: [...document.querySelectorAll(".brand-logo")].every((logo) => logo.complete && logo.naturalWidth > 0),
      footerLinkColors: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).color),
      footerLinkDecorations: [...document.querySelectorAll("footer nav a")].map((link) => getComputedStyle(link).textDecorationLine),
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(aiHub.title, "AI Knowledge Hub | QuickDevBase");
    assert.equal(aiHub.paths, 3);
    assert.equal(aiHub.genPath, "/ai/generative-ai");
    assert.equal(aiHub.ragPath, "/ai/rag");
    assert.equal(aiHub.agentPath, "/ai/agents");
    assert.equal(aiHub.hasSequence, true);
    assert.equal(aiHub.brandLogos, 2);
    assert.equal(aiHub.logosLoaded, true);
    assert.deepEqual([...new Set(aiHub.footerLinkColors)], ["rgb(36, 88, 166)"]);
    assert.deepEqual([...new Set(aiHub.footerLinkDecorations)], ["none"]);
    assert.equal(aiHub.noHorizontalOverflow, true);
    assert.deepEqual(aiHub.errors, []);
    await capture(screenshots.aiHub);

    await setViewport(390, 844, false);
    await client.send("Page.navigate", { url: `${baseUrl}/ai` });
    await waitFor(`document.readyState === "complete" && document.querySelectorAll("[data-ai-path]").length === 3`);
    const aiHubMobile = await evaluate(`({
      paths: document.querySelectorAll("[data-ai-path]").length,
      responsiveLayout: matchMedia("(max-width: 700px)").matches,
      logoLoaded: document.querySelector("header .brand-logo").complete && document.querySelector("header .brand-logo").naturalWidth > 0,
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(aiHubMobile.paths, 3);
    assert.equal(aiHubMobile.responsiveLayout, true);
    assert.equal(aiHubMobile.logoLoaded, true);
    assert.equal(aiHubMobile.noHorizontalOverflow, true);
    assert.deepEqual(aiHubMobile.errors, []);
    await capture(screenshots.aiHubMobile);

    await navigate(1440, 1000, false, "Sign in", "/ai/generative-ai", 12);
    const genAi = await evaluate(`({
      title: document.title,
      course: document.documentElement.dataset.course,
      modules: document.querySelectorAll(".module-card").length,
      concepts: [...document.querySelectorAll(".module-footer > span:first-child")]
        .reduce((total, item) => total + Number.parseInt(item.textContent, 10), 0),
      hubLink: document.querySelector(".main-nav a").getAttribute("href"),
      filters: [...document.querySelectorAll("#filterGroup .filter")].map((item) => item.textContent.trim()),
      errors: window.__qaErrors
    })`);
    assert.equal(genAi.title, "Generative AI at a Glance | QuickDevBase");
    assert.equal(genAi.course, "generative-ai");
    assert.equal(genAi.modules, 12);
    assert.equal(genAi.concepts, 84);
    assert.equal(genAi.hubLink, "/ai");
    assert.deepEqual(genAi.filters, ["All 12", "Foundations", "Building Blocks", "Quality & Production"]);
    assert.deepEqual(genAi.errors, []);
    await capture(screenshots.generativeAi);

    await navigate(1440, 1000, false, "Sign in", "/ai/rag", 12);
    const ragPath = await evaluate(`({
      title: document.title,
      course: document.documentElement.dataset.course,
      modules: document.querySelectorAll(".module-card").length,
      concepts: [...document.querySelectorAll(".module-footer > span:first-child")]
        .reduce((total, item) => total + Number.parseInt(item.textContent, 10), 0),
      hasReranking: document.documentElement.textContent.includes("Reranking"),
      errors: window.__qaErrors
    })`);
    assert.equal(ragPath.title, "RAG Systems at a Glance | QuickDevBase");
    assert.equal(ragPath.course, "rag");
    assert.equal(ragPath.modules, 12);
    assert.equal(ragPath.concepts, 84);
    assert.equal(ragPath.hasReranking, true);
    assert.deepEqual(ragPath.errors, []);
    await capture(screenshots.rag);

    await evaluate(`document.querySelector('.module-card[data-module-id="1"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    const responsiveDialog = [];
    for (const width of [430, 390, 360, 320]) {
      await setViewport(width, 844, false);
      await delay(120);
      const metrics = await evaluate(`(() => {
        const dialog = document.querySelector("#lessonDialog");
        const shell = dialog.querySelector(".dialog-shell");
        const sidebar = dialog.querySelector(".dialog-sidebar");
        const content = dialog.querySelector(".dialog-content");
        const title = dialog.querySelector("#dialogTitle");
        const firstConcept = dialog.querySelector(".concept-item");
        const rect = (element) => {
          const bounds = element.getBoundingClientRect();
          return { left: bounds.left, right: bounds.right, width: bounds.width };
        };
        return {
          viewportWidth: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          dialog: rect(dialog),
          shell: rect(shell),
          sidebar: rect(sidebar),
          content: rect(content),
          title: rect(title),
          firstConcept: rect(firstConcept),
          dialogScrollLeft: dialog.scrollLeft,
          shellScrollLeft: shell.scrollLeft,
          contentScrollLeft: content.scrollLeft,
          errors: window.__qaErrors
        };
      })()`);
      responsiveDialog.push(metrics);
      if (width === 430) await capture(screenshots.ragMobileDialog);
    }
    for (const metrics of responsiveDialog) {
      assert.equal(metrics.documentWidth <= metrics.viewportWidth, true, JSON.stringify(metrics));
      assert.equal(metrics.dialog.left >= 0 && metrics.dialog.right <= metrics.viewportWidth, true);
      assert.equal(metrics.shell.left >= metrics.dialog.left - 1 && metrics.shell.right <= metrics.dialog.right + 1, true);
      assert.equal(metrics.sidebar.left >= metrics.dialog.left - 1 && metrics.sidebar.right <= metrics.dialog.right + 1, true);
      assert.equal(metrics.content.left >= metrics.dialog.left - 1 && metrics.content.right <= metrics.dialog.right + 1, true);
      assert.equal(metrics.title.left >= metrics.content.left && metrics.title.right <= metrics.content.right, true);
      assert.equal(metrics.firstConcept.left >= metrics.content.left && metrics.firstConcept.right <= metrics.content.right, true);
      assert.equal(metrics.dialogScrollLeft, 0);
      assert.equal(metrics.shellScrollLeft, 0);
      assert.equal(metrics.contentScrollLeft, 0);
      assert.deepEqual(metrics.errors, []);
    }

    await navigate(1440, 1000, false, "Sign in", "/ai/agents", 12);
    const agentPath = await evaluate(`({
      title: document.title,
      course: document.documentElement.dataset.course,
      modules: document.querySelectorAll(".module-card").length,
      concepts: [...document.querySelectorAll(".module-footer > span:first-child")]
        .reduce((total, item) => total + Number.parseInt(item.textContent, 10), 0),
      hasMcp: document.documentElement.textContent.includes("MCP"),
      errors: window.__qaErrors
    })`);
    assert.equal(agentPath.title, "Agentic AI at a Glance | QuickDevBase");
    assert.equal(agentPath.course, "agentic-ai");
    assert.equal(agentPath.modules, 12);
    assert.equal(agentPath.concepts, 84);
    assert.equal(agentPath.hasMcp, true);
    assert.deepEqual(agentPath.errors, []);
    await capture(screenshots.agenticAi);

    await evaluate(`document.querySelector('.module-card[data-module-id="12"]').click()`);
    await waitFor(`document.querySelector("#lessonDialog").open`);
    const agentLesson = await evaluate(`(() => {
      const content = document.querySelector(".dialog-content");
      content.scrollTop = content.scrollHeight;
      const comments = [...document.querySelectorAll("#dialogConcepts .snippet-comment")].map((item) => item.textContent.trim());
      return {
        title: document.querySelector("#dialogTitle").textContent.trim(),
        concepts: document.querySelectorAll("#dialogConcepts .concept-item").length,
        hasPromptInjection: document.querySelector("#dialogConcepts").textContent.includes("Indirect prompt injection"),
        allCommented: comments.length === 7 && comments.every((comment) => comment.length > 30),
        officialUrl: document.querySelector("#dialogOfficialLink").href,
        scrollable: content.scrollHeight > content.clientHeight,
        overflowY: getComputedStyle(content).overflowY
      };
    })()`);
    assert.equal(agentLesson.title, "Guardrails & Agent Security");
    assert.equal(agentLesson.concepts, 7);
    assert.equal(agentLesson.hasPromptInjection, true);
    assert.equal(agentLesson.allCommented, true);
    assert.match(agentLesson.officialUrl, /^https:\/\/openai\.github\.io\/openai-agents-js\/guides\/guardrails\/?$/);
    assert.equal(agentLesson.scrollable, true);
    assert.equal(agentLesson.overflowY, "auto");
    await capture(screenshots.agentLesson);

    const sessionCookieName = "java_basecamp_session";
    const sessionCookieValue = cookieMap(certificateLearner.cookie).get(sessionCookieName);
    assert.ok(sessionCookieValue, "The synthetic learner session cookie is missing.");
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
    await waitFor(`!document.querySelector("#aiGuideStatusText").textContent.includes("Checking")`);
    const signedInAi = await evaluate(`({
      loginHidden: document.querySelector("#aiGuideLogin").hidden,
      status: document.querySelector("#aiGuideStatusText").textContent.trim(),
      disabled: [...document.querySelectorAll("[data-ai-mode]")].every((button) => button.disabled),
      errorState: document.querySelector("#aiGuideStatus").classList.contains("error")
    })`);
    assert.equal(signedInAi.loginHidden, true);
    assert.match(signedInAi.status, /not configured|requests left today/i);
    assert.equal(signedInAi.disabled, signedInAi.errorState);
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
    assert.match(publishedCertificate.credentialId, /^QDB-JAV-[A-Z0-9_-]{10}$/);
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
        courseLetterMarks: document.querySelectorAll(".certificate-mark, .seal").length,
        describesTopicReview: document.querySelector(".achievement").textContent.includes("reviewing every topic"),
        hash,
        linkedinUrl: document.querySelector(".linkedin-button").href,
        brandLogos: document.querySelectorAll(".brand-logo").length,
        logosLoaded: [...document.querySelectorAll(".brand-logo")].every((logo) => logo.complete && logo.naturalWidth > 0),
        footerLinkColors: [...document.querySelectorAll(".certificate-legal nav a")].map((link) => getComputedStyle(link).color),
        footerLinkDecorations: [...document.querySelectorAll(".certificate-legal nav a")].map((link) => getComputedStyle(link).textDecorationLine),
        containsPrivateEmail: document.documentElement.textContent.includes(${JSON.stringify(certificateLearner.email)}),
        fitsViewport: bounds.left >= 0 && bounds.right <= innerWidth,
        errors: window.__qaErrors
      };
    })()`);
    assert.ok(publicCertificate.title.includes("Verified Certificate"));
    assert.equal(publicCertificate.learnerName, certificateLearner.name);
    assert.equal(publicCertificate.verified, "Verified by QuickDevBase.in");
    assert.equal(publicCertificate.courseLetterMarks, 0);
    assert.equal(publicCertificate.describesTopicReview, true);
    assert.match(publicCertificate.hash, /^[a-f0-9]{64}$/);
    assert.ok(publicCertificate.linkedinUrl.includes(encodeURIComponent(publishedCertificate.shareUrl)));
    assert.equal(publicCertificate.brandLogos, 2);
    assert.equal(publicCertificate.logosLoaded, true);
    assert.deepEqual([...new Set(publicCertificate.footerLinkColors)], ["rgb(36, 88, 166)"]);
    assert.deepEqual([...new Set(publicCertificate.footerLinkDecorations)], ["none"]);
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
      brandLogos: document.querySelectorAll(".brand-logo").length,
      logosLoaded: [...document.querySelectorAll(".brand-logo")].every((logo) => logo.complete && logo.naturalWidth > 0),
      footerLinkColors: [...document.querySelectorAll(".legal-footer a:not(.footer-brand)")].map((link) => getComputedStyle(link).color),
      footerLinkDecorations: [...document.querySelectorAll(".legal-footer a:not(.footer-brand)")].map((link) => getComputedStyle(link).textDecorationLine),
      noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
      errors: window.__qaErrors
    })`);
    assert.equal(privacyPage.title, "Privacy notice");
    assert.equal(privacyPage.consentPromise, true);
    assert.equal(privacyPage.accountDeletion, true);
    assert.equal(privacyPage.brandLogos, 2);
    assert.equal(privacyPage.logosLoaded, true);
    assert.deepEqual([...new Set(privacyPage.footerLinkColors)], ["rgb(36, 88, 166)"]);
    assert.deepEqual([...new Set(privacyPage.footerLinkDecorations)], ["none"]);
    assert.equal(privacyPage.noHorizontalOverflow, true);
    assert.deepEqual(privacyPage.errors, []);
    await capture(screenshots.privacyMobile);

    await appRequest("/api/account", {
      method: "DELETE",
      cookie: certificateLearner.cookie,
      body: { confirmation: "DELETE", password: "LearnJava!42" },
    });

    console.log("Browser smoke test passed.");
    console.log(JSON.stringify({ library, teamDesktop, libraryMobile, libraryResponsiveWidths, teamMobile, desktop, auth, modernJava, restLesson, mobile, mobileRest, docker, dockerLesson, python, pythonMobile, pythonLesson, accountSettings, celebration, publishedCertificate, publicCertificate, mobileCertificate, privacyPage, screenshots }, null, 2));
  } finally {
    try {
      await appRequest("/api/account", {
        method: "DELETE",
        cookie: certificateLearner.cookie,
        body: { confirmation: "DELETE", password: "LearnJava!42" },
      });
    } catch {
      // Best-effort cleanup also removes the synthetic learner after a failed assertion.
    }
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
