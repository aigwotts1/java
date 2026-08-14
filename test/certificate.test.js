"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { CERTIFICATE_CONSENT_VERSION, certificatePayload, createApp, renderCertificatePage, validateName } = require("../server");

const row = {
  public_id: "aBcDeFgHiJkLmNoPqRsTuVwX",
  verification_hash: "a".repeat(64),
  user_name: "Ada <script>alert(1)</script>",
  course_code: "java-basecamp-complete",
  issued_at: new Date("2026-08-14T10:30:00.000Z"),
  is_public: true,
  published_at: new Date("2026-08-14T10:31:00.000Z"),
  unpublished_at: null,
};

test("certificate payload creates a stable public identity without exposing email", () => {
  const previousPublicUrl = process.env.PUBLIC_APP_URL;
  process.env.PUBLIC_APP_URL = "https://learn.example.com/";

  try {
    const payload = certificatePayload(row, { protocol: "http", get: () => "localhost:3000" });
    assert.equal(payload.credentialId, "JBC-ABCDEFGHIJ");
    assert.equal(payload.shareUrl, `https://learn.example.com/certificate/${row.public_id}`);
    assert.equal(payload.verificationHash, row.verification_hash);
    assert.equal(payload.moduleCount, 18);
    assert.equal(payload.conceptCount, 135);
    assert.equal(payload.isPublic, true);
    assert.equal(Object.hasOwn(payload, "email"), false);
    assert.equal(
      payload.linkedInShareUrl,
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(payload.shareUrl)}`,
    );
  } finally {
    if (previousPublicUrl === undefined) delete process.env.PUBLIC_APP_URL;
    else process.env.PUBLIC_APP_URL = previousPublicUrl;
  }
});

test("public certificate page escapes learner data and includes verification metadata", () => {
  const payload = certificatePayload(row, { protocol: "http", get: () => "localhost:3000" });
  const html = renderCertificatePage(payload);

  assert.match(html, /Ada &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /Verified course completion record/);
  assert.match(html, /not a professional licence/);
  assert.match(html, /not affiliated with, endorsed by, or sponsored by Oracle/);
  assert.match(html, new RegExp(row.verification_hash));
  assert.match(html, /id="printCertificate"/);
  assert.match(html, /src="\/certificate\.js"/);
});

test("certificate consent version and public-name validation are explicit", () => {
  assert.equal(CERTIFICATE_CONSENT_VERSION, "2026-08-14");
  assert.deepEqual(validateName("  Grace   Hopper "), { name: "Grace Hopper", error: null });
  assert.match(validateName("A").error, /between 2 and 60/);
});

test("deployment rejects unsafe public certificate URL configuration", () => {
  const previous = process.env.PUBLIC_APP_URL;
  process.env.PUBLIC_APP_URL = "javascript:alert(1)";
  try {
    assert.throws(() => createApp({}), /http:\/\/ or https:\/\/ origin/);
  } finally {
    if (previous === undefined) delete process.env.PUBLIC_APP_URL;
    else process.env.PUBLIC_APP_URL = previous;
  }
});
