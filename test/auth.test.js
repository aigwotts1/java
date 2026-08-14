"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { hashPassword, normalizeEmail, parseCookies, tokenHash, validateRegistration, verifyPassword } = require("../server");

test("passwords are salted, hashed, and verified safely", async () => {
  const first = await hashPassword("learn-java-123");
  const second = await hashPassword("learn-java-123");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("learn-java-123", first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
});

test("registration normalization and validation returns clean identity data", () => {
  const result = validateRegistration({ name: "  Ada   Lovelace ", email: " ADA@Example.COM ", password: "strong-pass" });
  assert.deepEqual(result.errors, []);
  assert.equal(result.name, "Ada Lovelace");
  assert.equal(result.email, "ada@example.com");
  assert.equal(normalizeEmail(" USER@EXAMPLE.COM "), "user@example.com");
});

test("registration rejects weak or malformed input", () => {
  assert.ok(validateRegistration({ name: "A", email: "bad", password: "short" }).errors.length >= 3);
});

test("cookie parser and token hash are deterministic", () => {
  assert.deepEqual(parseCookies("theme=dark; java_basecamp_session=abc123"), { theme: "dark", java_basecamp_session: "abc123" });
  assert.equal(tokenHash("abc"), tokenHash("abc"));
  assert.notEqual(tokenHash("abc"), tokenHash("abcd"));
});
