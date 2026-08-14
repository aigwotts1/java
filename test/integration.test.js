const { test } = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = process.env.TEST_BASE_URL;

async function request(path, { method = "GET", body, cookie } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (cookie) {
    headers.Cookie = cookie;
  }

  if (method !== "GET" && method !== "HEAD") {
    headers.Origin = baseUrl;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const data = text && contentType.includes("application/json") ? JSON.parse(text) : text || null;
  const setCookie = response.headers.get("set-cookie");

  return {
    status: response.status,
    data,
    setCookie,
    cookie: setCookie ? setCookie.split(";", 1)[0] : cookie,
  };
}

test(
  "accounts keep progress isolated and sessions survive logout/login",
  { skip: !baseUrl },
  async () => {
    const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const password = "LearnJava!42";

    const health = await request("/health");
    assert.equal(health.status, 200);
    assert.equal(health.data.status, "ok");

    const firstRegistration = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Ada Learner",
        email: `ada-${nonce}@example.com`,
        password,
      },
    });
    assert.equal(firstRegistration.status, 201);
    assert.match(firstRegistration.data.user.id, /^[0-9a-f-]{36}$/i);
    assert.match(firstRegistration.setCookie, /HttpOnly/i);
    assert.match(firstRegistration.setCookie, /SameSite=Lax/i);
    const firstCookie = firstRegistration.cookie;

    for (const moduleId of [1, 3, 18]) {
      const saved = await request(`/api/progress/${moduleId}`, {
        method: "PUT",
        cookie: firstCookie,
        body: { completed: true },
      });
      assert.equal(saved.status, 200);
    }

    const secondRegistration = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Grace Learner",
        email: `grace-${nonce}@example.com`,
        password,
      },
    });
    assert.equal(secondRegistration.status, 201);
    const secondCookie = secondRegistration.cookie;

    const secondInitialProgress = await request("/api/progress", {
      cookie: secondCookie,
    });
    assert.equal(secondInitialProgress.status, 200);
    assert.deepEqual(secondInitialProgress.data.completed, []);

    const secondSaved = await request("/api/progress/2", {
      method: "PUT",
      cookie: secondCookie,
      body: { completed: true },
    });
    assert.equal(secondSaved.status, 200);

    const loggedOut = await request("/api/auth/logout", {
      method: "POST",
      cookie: firstCookie,
    });
    assert.equal(loggedOut.status, 204);

    const loggedInAgain = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: `ada-${nonce}@example.com`,
        password,
      },
    });
    assert.equal(loggedInAgain.status, 200);

    const firstProgress = await request("/api/progress", {
      cookie: loggedInAgain.cookie,
    });
    assert.deepEqual(firstProgress.data.completed, [1, 3, 18]);

    const dockerSaved = await request("/api/progress/2?course=docker", {
      method: "PUT",
      cookie: loggedInAgain.cookie,
      body: { completed: true },
    });
    assert.equal(dockerSaved.status, 200);
    assert.equal(dockerSaved.data.course, "docker");
    const dockerProgress = await request("/api/progress?course=docker", { cookie: loggedInAgain.cookie });
    assert.deepEqual(dockerProgress.data.completed, [2]);
    assert.deepEqual((await request("/api/progress?course=java", { cookie: loggedInAgain.cookie })).data.completed, [1, 3, 18]);

    const secondProgress = await request("/api/progress", {
      cookie: secondCookie,
    });
    assert.deepEqual(secondProgress.data.completed, [2]);

    const duplicate = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Duplicate",
        email: `ada-${nonce}@example.com`,
        password,
      },
    });
    assert.equal(duplicate.status, 409);

    for (const cleanupCookie of [loggedInAgain.cookie, secondCookie]) {
      const cleanup = await request("/api/account", {
        method: "DELETE",
        cookie: cleanupCookie,
        body: { confirmation: "DELETE", password },
      });
      assert.equal(cleanup.status, 204);
    }
  },
);

test(
  "certificate requires consent, can be unpublished, and stays uniquely verifiable",
  { skip: !baseUrl },
  async () => {
    const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const email = `certificate-${nonce}@example.com`;
    const registration = await request("/api/auth/register", {
      method: "POST",
      body: { name: "Katherine Johnson", email, password: "LearnJava!42" },
    });
    assert.equal(registration.status, 201);
    const cookie = registration.cookie;

    const initialStatus = await request("/api/certificate", { cookie });
    assert.equal(initialStatus.status, 200);
    assert.equal(initialStatus.data.eligible, false);
    assert.equal(initialStatus.data.completedCount, 0);
    assert.equal(initialStatus.data.requiredCount, 18);
    assert.equal(initialStatus.data.certificate, null);
    assert.equal(initialStatus.data.consentVersion, "2026-08-14");

    const missingConsent = await request("/api/certificate/claim", {
      method: "POST",
      cookie,
    });
    assert.equal(missingConsent.status, 400);

    const earlyClaim = await request("/api/certificate/claim", {
      method: "POST",
      cookie,
      body: { consent: true, consentVersion: initialStatus.data.consentVersion },
    });
    assert.equal(earlyClaim.status, 409);

    for (let moduleId = 1; moduleId <= 17; moduleId += 1) {
      const saved = await request(`/api/progress/${moduleId}`, {
        method: "PUT",
        cookie,
        body: { completed: true },
      });
      assert.equal(saved.status, 200);
      assert.equal(saved.data.certificate, null);
      assert.equal(saved.data.certificateEligible, false);
    }

    const completion = await request("/api/progress/18", {
      method: "PUT",
      cookie,
      body: { completed: true },
    });
    assert.equal(completion.status, 200);
    assert.equal(completion.data.certificateEligible, true);
    assert.equal(completion.data.certificate, null);

    const eligibleStatus = await request("/api/certificate", { cookie });
    assert.equal(eligibleStatus.data.eligible, true);
    assert.equal(eligibleStatus.data.completedCount, 18);
    assert.equal(eligibleStatus.data.certificate, null);

    const claim = await request("/api/certificate/claim", {
      method: "POST",
      cookie,
      body: {
        consent: true,
        consentVersion: eligibleStatus.data.consentVersion,
        publicName: "Katherine Johnson",
      },
    });
    assert.equal(claim.status, 201);
    assert.equal(claim.data.newlyIssued, true);
    assert.equal(claim.data.newlyPublished, true);
    assert.equal(claim.data.certificate.isPublic, true);
    assert.match(claim.data.certificate.publicId, /^[A-Za-z0-9_-]{24}$/);
    assert.match(claim.data.certificate.verificationHash, /^[a-f0-9]{64}$/);
    assert.match(claim.data.certificate.credentialId, /^QDB-JAV-[A-Z0-9_-]{10}$/);
    assert.match(claim.data.certificate.shareUrl, /\/certificate\//);
    assert.equal(claim.data.certificate.moduleCount, 18);
    assert.equal(claim.data.certificate.conceptCount, 135);

    const certificate = claim.data.certificate;

    const repeatClaim = await request("/api/certificate/claim", {
      method: "POST",
      cookie,
      body: {
        consent: true,
        consentVersion: eligibleStatus.data.consentVersion,
        publicName: "Katherine Johnson",
      },
    });
    assert.equal(repeatClaim.status, 200);
    assert.equal(repeatClaim.data.newlyIssued, false);
    assert.equal(repeatClaim.data.newlyPublished, false);
    assert.equal(repeatClaim.data.certificate.publicId, certificate.publicId);

    const publicLookup = await request(`/api/certificates/${certificate.publicId}`);
    assert.equal(publicLookup.status, 200);
    assert.equal(publicLookup.data.verified, true);
    assert.equal(publicLookup.data.certificate.name, "Katherine Johnson");
    assert.equal(JSON.stringify(publicLookup.data).includes(email), false);

    const hashLookup = await request(`/api/certificates/verify/${certificate.verificationHash}`);
    assert.equal(hashLookup.status, 200);
    assert.equal(hashLookup.data.certificate.publicId, certificate.publicId);

    const publicPage = await request(`/certificate/${certificate.publicId}`);
    assert.equal(publicPage.status, 200);
    assert.match(publicPage.data, /Katherine Johnson/);
    assert.match(publicPage.data, /Java Developer Knowledge Path/);
    assert.match(publicPage.data, /property="og:title"/);
    assert.match(publicPage.data, /linkedin\.com\/sharing\/share-offsite/);
    assert.match(publicPage.data, new RegExp(certificate.verificationHash));
    assert.match(publicPage.data, /not a professional licence/);
    assert.match(publicPage.data, /not affiliated with or endorsed by Oracle/);
    assert.equal(publicPage.data.includes(email), false);

    const renamed = await request("/api/profile", {
      method: "PATCH",
      cookie,
      body: { name: "Katherine G. Johnson" },
    });
    assert.equal(renamed.status, 200);
    assert.equal(renamed.data.user.name, "Katherine G. Johnson");
    const renamedPublic = await request(`/api/certificates/${certificate.publicId}`);
    assert.equal(renamedPublic.data.certificate.name, "Katherine G. Johnson");

    const uncompleted = await request("/api/progress/18", {
      method: "PUT",
      cookie,
      body: { completed: false },
    });
    assert.equal(uncompleted.status, 200);
    const stillPublic = await request(`/api/certificates/${certificate.publicId}`);
    assert.equal(stillPublic.status, 200);
    assert.equal(stillPublic.data.verified, true);

    const unpublished = await request("/api/certificate/publication", {
      method: "DELETE",
      cookie,
    });
    assert.equal(unpublished.status, 200);
    assert.equal(unpublished.data.certificate.isPublic, false);
    assert.equal((await request(`/api/certificates/${certificate.publicId}`)).status, 404);
    assert.equal((await request(`/api/certificates/verify/${certificate.verificationHash}`)).status, 404);
    assert.equal((await request(`/certificate/${certificate.publicId}`)).status, 404);

    const privateStatus = await request("/api/certificate", { cookie });
    assert.equal(privateStatus.status, 200);
    assert.equal(privateStatus.data.eligible, true);
    assert.equal(privateStatus.data.certificate.publicId, certificate.publicId);
    assert.equal(privateStatus.data.certificate.isPublic, false);

    const republished = await request("/api/certificate/claim", {
      method: "POST",
      cookie,
      body: {
        consent: true,
        consentVersion: privateStatus.data.consentVersion,
        publicName: "Katherine G. Johnson",
      },
    });
    assert.equal(republished.status, 200);
    assert.equal(republished.data.newlyIssued, false);
    assert.equal(republished.data.newlyPublished, true);
    assert.equal(republished.data.certificate.publicId, certificate.publicId);
    assert.equal((await request(`/api/certificates/${certificate.publicId}`)).status, 200);

    for (const legalPath of ["/privacy", "/terms", "/certificate-policy"]) {
      const legalPage = await request(legalPath);
      assert.equal(legalPage.status, 200);
    }

    const missing = await request("/api/certificates/000000000000000000000000");
    assert.equal(missing.status, 404);

    const wrongDeletion = await request("/api/account", {
      method: "DELETE",
      cookie,
      body: { confirmation: "DELETE", password: "wrong-password" },
    });
    assert.equal(wrongDeletion.status, 401);

    const deletion = await request("/api/account", {
      method: "DELETE",
      cookie,
      body: { confirmation: "DELETE", password: "LearnJava!42" },
    });
    assert.equal(deletion.status, 204);
    assert.equal((await request(`/api/certificates/${certificate.publicId}`)).status, 404);
    assert.equal((await request("/api/progress", { cookie })).status, 401);
  },
);

test(
  "Docker completion earns a Docker-scoped certificate without changing Java progress",
  { skip: !baseUrl },
  async () => {
    const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const password = "LearnDocker!42";
    const registration = await request("/api/auth/register", {
      method: "POST",
      body: { name: "Docker Learner", email: `docker-${nonce}@example.com`, password },
    });
    assert.equal(registration.status, 201);
    const cookie = registration.cookie;

    for (let moduleId = 1; moduleId <= 18; moduleId += 1) {
      const saved = await request(`/api/progress/${moduleId}?course=docker`, {
        method: "PUT",
        cookie,
        body: { completed: true },
      });
      assert.equal(saved.status, 200);
    }

    assert.deepEqual((await request("/api/progress?course=java", { cookie })).data.completed, []);
    const status = await request("/api/certificate?course=docker", { cookie });
    assert.equal(status.data.eligible, true);
    assert.equal(status.data.completedCount, 18);

    const claim = await request("/api/certificate/claim?course=docker", {
      method: "POST",
      cookie,
      body: {
        consent: true,
        consentVersion: status.data.consentVersion,
        publicName: "Docker Learner",
      },
    });
    assert.equal(claim.status, 201);
    assert.equal(claim.data.certificate.courseKey, "docker");
    assert.equal(claim.data.certificate.courseTitle, "Docker Developer Knowledge Path");
    assert.equal(claim.data.certificate.conceptCount, 126);
    assert.match(claim.data.certificate.credentialId, /^QDB-DOC-/);

    const publicPage = await request(`/certificate/${claim.data.certificate.publicId}`);
    assert.equal(publicPage.status, 200);
    assert.match(publicPage.data, /Docker Developer Knowledge Path/);
    assert.match(publicPage.data, /not affiliated with or endorsed by Docker, Inc/);

    const cleanup = await request("/api/account", {
      method: "DELETE",
      cookie,
      body: { confirmation: "DELETE", password },
    });
    assert.equal(cleanup.status, 204);
  },
);

test(
  "Agentic AI completion earns its own 12-module certificate and leaves the other AI paths untouched",
  { skip: !baseUrl },
  async () => {
    const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const password = "LearnAgents!42";
    const registration = await request("/api/auth/register", {
      method: "POST",
      body: { name: "Agent Learner", email: `agent-${nonce}@example.com`, password },
    });
    assert.equal(registration.status, 201);
    const cookie = registration.cookie;

    for (let moduleId = 1; moduleId <= 12; moduleId += 1) {
      const saved = await request(`/api/progress/${moduleId}?course=agentic-ai`, {
        method: "PUT",
        cookie,
        body: { completed: true },
      });
      assert.equal(saved.status, 200);
    }

    assert.deepEqual((await request("/api/progress?course=generative-ai", { cookie })).data.completed, []);
    assert.deepEqual((await request("/api/progress?course=rag", { cookie })).data.completed, []);
    const status = await request("/api/certificate?course=agentic-ai", { cookie });
    assert.equal(status.data.eligible, true);
    assert.equal(status.data.completedCount, 12);
    assert.equal(status.data.requiredCount, 12);

    const claim = await request("/api/certificate/claim?course=agentic-ai", {
      method: "POST",
      cookie,
      body: {
        consent: true,
        consentVersion: status.data.consentVersion,
        publicName: "Agent Learner",
      },
    });
    assert.equal(claim.status, 201);
    assert.equal(claim.data.certificate.courseKey, "agentic-ai");
    assert.equal(claim.data.certificate.courseTitle, "Agentic AI Knowledge Path");
    assert.equal(claim.data.certificate.moduleCount, 12);
    assert.equal(claim.data.certificate.conceptCount, 84);
    assert.match(claim.data.certificate.credentialId, /^QDB-AGE-/);

    const publicPage = await request(`/certificate/${claim.data.certificate.publicId}`);
    assert.equal(publicPage.status, 200);
    assert.match(publicPage.data, /Agentic AI Knowledge Path/);
    assert.match(publicPage.data, /no vendor endorses this completion record/);

    const cleanup = await request("/api/account", {
      method: "DELETE",
      cookie,
      body: { confirmation: "DELETE", password },
    });
    assert.equal(cleanup.status, 204);
  },
);
