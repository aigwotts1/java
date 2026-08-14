"use strict";

const crypto = require("node:crypto");
const path = require("node:path");
const { promisify } = require("node:util");
const express = require("express");
const { Pool } = require("pg");

const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const SESSION_DAYS = Math.max(1, Number(process.env.SESSION_DAYS || 30));
const COOKIE_NAME = "java_basecamp_session";
const MODULE_COUNT = 18;
const CONCEPT_COUNT = 135;
const COURSE_CODE = "java-basecamp-complete";
const COURSE_TITLE = "Complete Java Developer Path";

function databaseOptions() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Copy .env.example or use docker compose.");
  }

  return {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
    max: Number(process.env.DB_POOL_SIZE || 10),
    idleTimeoutMillis: 30_000
  };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validateRegistration({ name, email, password }) {
  const cleanName = String(name || "").trim().replace(/\s+/g, " ");
  const cleanEmail = normalizeEmail(email);
  const errors = [];

  if (cleanName.length < 2 || cleanName.length > 60) errors.push("Name must be between 2 and 60 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) errors.push("Enter a valid email address.");
  if (typeof password !== "string" || password.length < 8 || password.length > 128) errors.push("Password must be between 8 and 128 characters.");

  return { name: cleanName, email: cleanEmail, password, errors };
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [algorithm, salt, expectedHex] = String(stored || "").split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;

  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseCookies(header = "") {
  return header.split(";").reduce((cookies, entry) => {
    const separator = entry.indexOf("=");
    if (separator < 0) return cookies;
    const name = entry.slice(0, separator).trim();
    const value = entry.slice(separator + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appOrigin(req) {
  return String(process.env.PUBLIC_APP_URL || process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function certificatePayload(row, req) {
  if (!row) return null;
  const shareUrl = `${appOrigin(req)}/certificate/${encodeURIComponent(row.public_id)}`;
  return {
    credentialId: `JBC-${row.public_id.slice(0, 10).toUpperCase()}`,
    publicId: row.public_id,
    verificationHash: row.verification_hash,
    name: row.user_name || row.name,
    courseCode: row.course_code,
    courseTitle: COURSE_TITLE,
    issuedAt: row.issued_at,
    moduleCount: MODULE_COUNT,
    conceptCount: CONCEPT_COUNT,
    shareUrl,
    linkedInShareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  };
}

async function findCertificate(client, userId) {
  const result = await client.query(
    `SELECT c.id, c.public_id, c.verification_hash, c.course_code, c.issued_at, u.name AS user_name
     FROM certificates c
     JOIN users u ON u.id = c.user_id
     WHERE c.user_id = $1 AND c.course_code = $2`,
    [userId, COURSE_CODE]
  );
  return result.rows[0] || null;
}

async function issueCertificate(client, user) {
  const progress = await client.query(
    "SELECT COUNT(*)::int AS completed_count FROM learning_progress WHERE user_id = $1",
    [user.id]
  );
  const completedCount = progress.rows[0].completed_count;
  if (completedCount < MODULE_COUNT) return { certificate: null, completedCount, eligible: false, newlyIssued: false };

  const existing = await findCertificate(client, user.id);
  if (existing) return { certificate: existing, completedCount, eligible: true, newlyIssued: false };

  const id = crypto.randomUUID();
  const publicId = crypto.randomBytes(18).toString("base64url");
  const verificationHash = crypto.createHash("sha256").update(crypto.randomBytes(64)).digest("hex");
  const result = await client.query(
    `INSERT INTO certificates (id, public_id, verification_hash, user_id, course_code)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, course_code) DO NOTHING
     RETURNING id, public_id, verification_hash, course_code, issued_at`,
    [id, publicId, verificationHash, user.id, COURSE_CODE]
  );

  if (result.rowCount) {
    return {
      certificate: { ...result.rows[0], user_name: user.name },
      completedCount,
      eligible: true,
      newlyIssued: true
    };
  }

  return {
    certificate: await findCertificate(client, user.id),
    completedCount,
    eligible: true,
    newlyIssued: false
  };
}

function createRateLimiter({ windowMs, limit }) {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${normalizeEmail(req.body?.email)}`;
    const now = Date.now();
    const current = attempts.get(key);
    const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    entry.count += 1;
    attempts.set(key, entry);

    if (entry.count > limit) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: "Too many attempts. Please wait a few minutes and try again." });
    }
    next();
  };
}

async function initializeDatabase(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(254) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash CHAR(64) PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS learning_progress (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id SMALLINT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, module_id)
    );

    ALTER TABLE learning_progress
      DROP CONSTRAINT IF EXISTS learning_progress_module_id_check;

    ALTER TABLE learning_progress
      ADD CONSTRAINT learning_progress_module_id_check
      CHECK (module_id BETWEEN 1 AND ${MODULE_COUNT});

    CREATE TABLE IF NOT EXISTS certificates (
      id UUID PRIMARY KEY,
      public_id VARCHAR(32) NOT NULL UNIQUE,
      verification_hash CHAR(64) NOT NULL UNIQUE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_code VARCHAR(80) NOT NULL,
      issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, course_code)
    );

    CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON certificates(user_id);
    CREATE INDEX IF NOT EXISTS certificates_issued_at_idx ON certificates(issued_at);
  `);
  await pool.query("DELETE FROM sessions WHERE expires_at <= NOW()");
}

async function waitForDatabase(pool, attempts = 30) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
  throw lastError;
}

async function findPublicCertificate(client, field, value) {
  const column = field === "verification_hash" ? "verification_hash" : "public_id";
  const result = await client.query(
    `SELECT c.id, c.public_id, c.verification_hash, c.course_code, c.issued_at, u.name AS user_name
     FROM certificates c
     JOIN users u ON u.id = c.user_id
     WHERE c.${column} = $1`,
    [value]
  );
  return result.rows[0] || null;
}

function formatCertificateDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

function renderCertificatePage(certificate) {
  const title = `${certificate.name} — ${certificate.courseTitle}`;
  const description = `${certificate.name} completed all ${certificate.moduleCount} Java Basecamp modules and ${certificate.conceptCount} concepts.`;
  const issuedDate = formatCertificateDate(certificate.issuedAt);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#15386b" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Java Basecamp" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(certificate.shareUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="${escapeHtml(certificate.shareUrl)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700;800&family=Young+Serif&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/certificate.css" />
    <title>${escapeHtml(title)} | Verified Certificate</title>
  </head>
  <body data-certificate-url="${escapeHtml(certificate.shareUrl)}">
    <main class="certificate-page">
      <nav class="certificate-nav" aria-label="Certificate actions">
        <a class="certificate-brand" href="/" aria-label="Java Basecamp home"><span>J</span> Java<strong>Basecamp</strong></a>
        <div>
          <button id="copyCertificateLink" type="button">Copy link</button>
          <button id="printCertificate" type="button">Print / save PDF</button>
          <a class="linkedin-button" href="${escapeHtml(certificate.linkedInShareUrl)}" target="_blank" rel="noopener noreferrer">Share on LinkedIn <span aria-hidden="true">↗</span></a>
        </div>
      </nav>

      <article class="certificate" aria-labelledby="certificateTitle">
        <div class="certificate-orbit orbit-one" aria-hidden="true"></div>
        <div class="certificate-orbit orbit-two" aria-hidden="true"></div>
        <div class="certificate-corner corner-one" aria-hidden="true"></div>
        <div class="certificate-corner corner-two" aria-hidden="true"></div>

        <header class="certificate-header">
          <div class="certificate-mark" aria-hidden="true">J</div>
          <div>
            <span>Java Basecamp</span>
            <small>Verified learning credential</small>
          </div>
          <div class="verified-pill"><i aria-hidden="true">✓</i> Authenticated</div>
        </header>

        <section class="certificate-body">
          <p class="certificate-kicker"><span></span> Certificate of completion <span></span></p>
          <h1 id="certificateTitle">Complete Java<br />Developer Path</h1>
          <p class="presented">This credential is proudly presented to</p>
          <h2>${escapeHtml(certificate.name)}</h2>
          <p class="achievement">for completing the full Java Basecamp curriculum—<strong>${certificate.moduleCount} modules</strong> and <strong>${certificate.conceptCount} concepts</strong>, from Java fundamentals and OOP to Spring Boot, REST APIs, JVM internals, testing, and DSA.</p>

          <div class="certificate-metrics" aria-label="Achievement details">
            <div><strong>100%</strong><span>Course progress</span></div>
            <div><strong>${certificate.moduleCount}</strong><span>Modules completed</span></div>
            <div><strong>${certificate.conceptCount}</strong><span>Concepts covered</span></div>
          </div>
        </section>

        <footer class="certificate-footer">
          <div class="issued-block"><span>Issued on</span><strong>${escapeHtml(issuedDate)}</strong></div>
          <div class="seal" aria-label="Java Basecamp verified seal"><span>J</span><small>VERIFIED</small></div>
          <div class="credential-block"><span>Credential ID</span><strong>${escapeHtml(certificate.credentialId)}</strong></div>
        </footer>

        <div class="verification-strip">
          <div><i aria-hidden="true">✓</i><span><strong>Publicly verified</strong><small>This record matches the Java Basecamp certificate database.</small></span></div>
          <code>${escapeHtml(certificate.verificationHash)}</code>
        </div>
      </article>

      <p class="certificate-note">Anyone with this link can verify this achievement. No email address or private account information is displayed.</p>
      <div class="copy-toast" id="copyToast" role="status" aria-live="polite">Certificate link copied</div>
    </main>
    <script src="/certificate.js" defer></script>
  </body>
</html>`;
}

function createApp(pool) {
  const app = express();
  const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 12 });
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    });
    next();
  });

  app.use((req, res, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const origin = req.get("origin");
      const allowedOrigin = process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`;
      if (origin && origin !== allowedOrigin) return res.status(403).json({ error: "Request origin is not allowed." });
    }
    next();
  });

  function setSessionCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
      path: "/"
    });
  }

  function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
      path: "/"
    });
  }

  async function createSession(client, userId) {
    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await client.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [tokenHash(token), userId, expiresAt]);
    return token;
  }

  async function authenticate(req, res, next) {
    try {
      const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
      if (!token) return res.status(401).json({ error: "Sign in to continue." });
      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.created_at
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
        [tokenHash(token)]
      );
      if (!result.rowCount) {
        clearSessionCookie(res);
        return res.status(401).json({ error: "Your session has expired. Please sign in again." });
      }
      req.user = result.rows[0];
      req.sessionToken = token;
      next();
    } catch (error) {
      next(error);
    }
  }

  app.get("/health", async (req, res, next) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/register", authLimiter, async (req, res, next) => {
    const registration = validateRegistration(req.body || {});
    if (registration.errors.length) return res.status(400).json({ error: registration.errors[0] });

    const client = await pool.connect();
    try {
      const passwordHash = await hashPassword(registration.password);
      const userId = crypto.randomUUID();
      await client.query("BEGIN");
      const result = await client.query(
        "INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, created_at",
        [userId, registration.name, registration.email, passwordHash]
      );
      const token = await createSession(client, userId);
      await client.query("COMMIT");
      setSessionCookie(res, token);
      res.status(201).json({ user: publicUser(result.rows[0]) });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") return res.status(409).json({ error: "An account with that email already exists." });
      next(error);
    } finally {
      client.release();
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res, next) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    try {
      const result = await pool.query("SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1", [email]);
      const row = result.rows[0];
      const valid = row ? await verifyPassword(password, row.password_hash) : false;
      if (!valid) return res.status(401).json({ error: "Email or password is incorrect." });

      const token = await createSession(pool, row.id);
      setSessionCookie(res, token);
      res.json({ user: publicUser(row) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/logout", async (req, res, next) => {
    try {
      const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
      if (token) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash(token)]);
      clearSessionCookie(res);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/auth/me", async (req, res, next) => {
    try {
      const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
      if (!token) return res.json({ user: null });
      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.created_at
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
        [tokenHash(token)]
      );
      if (!result.rowCount) clearSessionCookie(res);
      res.json({ user: result.rowCount ? publicUser(result.rows[0]) : null });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/progress", authenticate, async (req, res, next) => {
    try {
      const result = await pool.query("SELECT module_id FROM learning_progress WHERE user_id = $1 ORDER BY module_id", [req.user.id]);
      res.json({ completed: result.rows.map((row) => row.module_id) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/certificate", authenticate, async (req, res, next) => {
    try {
      const [certificate, progress] = await Promise.all([
        findCertificate(pool, req.user.id),
        pool.query("SELECT COUNT(*)::int AS completed_count FROM learning_progress WHERE user_id = $1", [req.user.id])
      ]);
      const completedCount = progress.rows[0].completed_count;
      res.json({
        certificate: certificatePayload(certificate, req),
        eligible: completedCount >= MODULE_COUNT,
        completedCount,
        requiredCount: MODULE_COUNT
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/certificate/claim", authenticate, async (req, res, next) => {
    try {
      const result = await issueCertificate(pool, req.user);
      if (!result.eligible) {
        return res.status(409).json({
          error: `Complete all ${MODULE_COUNT} modules before claiming your certificate.`,
          completedCount: result.completedCount,
          requiredCount: MODULE_COUNT
        });
      }
      res.status(result.newlyIssued ? 201 : 200).json({
        certificate: certificatePayload(result.certificate, req),
        newlyIssued: result.newlyIssued
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/certificates/:publicId", async (req, res, next) => {
    if (!/^[A-Za-z0-9_-]{20,32}$/.test(req.params.publicId)) return res.status(404).json({ error: "Certificate not found." });
    try {
      const certificate = await findPublicCertificate(pool, "public_id", req.params.publicId);
      if (!certificate) return res.status(404).json({ error: "Certificate not found." });
      res.json({ certificate: certificatePayload(certificate, req), verified: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/certificates/verify/:hash", async (req, res, next) => {
    if (!/^[a-f0-9]{64}$/.test(req.params.hash)) return res.status(404).json({ error: "Certificate not found." });
    try {
      const certificate = await findPublicCertificate(pool, "verification_hash", req.params.hash);
      if (!certificate) return res.status(404).json({ error: "Certificate not found." });
      res.json({ certificate: certificatePayload(certificate, req), verified: true });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/progress/:moduleId", authenticate, async (req, res, next) => {
    const moduleId = Number(req.params.moduleId);
    if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > MODULE_COUNT) {
      return res.status(400).json({ error: "Unknown learning module." });
    }
    if (typeof req.body?.completed !== "boolean") return res.status(400).json({ error: "completed must be true or false." });

    try {
      if (req.body.completed) {
        await pool.query(
          `INSERT INTO learning_progress (user_id, module_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, module_id) DO UPDATE SET completed_at = NOW()`,
          [req.user.id, moduleId]
        );
      } else {
        await pool.query("DELETE FROM learning_progress WHERE user_id = $1 AND module_id = $2", [req.user.id, moduleId]);
      }
      const achievement = req.body.completed
        ? await issueCertificate(pool, req.user)
        : { certificate: null, newlyIssued: false };
      res.json({
        moduleId,
        completed: req.body.completed,
        certificate: certificatePayload(achievement.certificate, req),
        certificateNewlyIssued: achievement.newlyIssued
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));
  app.get("/styles.css", (req, res) => res.sendFile(path.join(ROOT, "styles.css")));
  app.get("/app.js", (req, res) => res.sendFile(path.join(ROOT, "app.js")));
  app.get("/certificate.css", (req, res) => res.sendFile(path.join(ROOT, "certificate.css")));
  app.get("/certificate.js", (req, res) => res.sendFile(path.join(ROOT, "certificate.js")));
  app.get("/certificate/:publicId", async (req, res, next) => {
    if (!/^[A-Za-z0-9_-]{20,32}$/.test(req.params.publicId)) return res.status(404).send("Certificate not found.");
    try {
      const row = await findPublicCertificate(pool, "public_id", req.params.publicId);
      if (!row) return res.status(404).send("Certificate not found.");
      res.type("html").send(renderCertificatePage(certificatePayload(row, req)));
    } catch (error) {
      next(error);
    }
  });

  app.use("/api", (req, res) => res.status(404).json({ error: "API route not found." }));
  app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  });

  return app;
}

async function start() {
  const pool = new Pool(databaseOptions());
  await waitForDatabase(pool);
  await initializeDatabase(pool);
  const app = createApp(pool);
  const server = app.listen(PORT, "0.0.0.0", () => console.log(`Java Basecamp running on port ${PORT}`));

  const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Unable to start Java Basecamp:", error);
    process.exit(1);
  });
}

module.exports = {
  certificatePayload,
  createApp,
  escapeHtml,
  hashPassword,
  issueCertificate,
  normalizeEmail,
  parseCookies,
  renderCertificatePage,
  tokenHash,
  validateRegistration,
  verifyPassword
};
