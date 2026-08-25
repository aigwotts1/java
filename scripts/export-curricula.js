"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "src", "main", "resources", "curriculum");

function evaluate(filename, globalName) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, filename), "utf8"), context, { filename });
  return JSON.parse(JSON.stringify(context.window[globalName]));
}

function write(filename, value) {
  fs.writeFileSync(path.join(output, filename), JSON.stringify(value, null, 2) + "\n", "utf8");
}

write("docker.json", evaluate("docker-data.js", "QUICKDEV_COURSE"));
write("python.json", evaluate("python-data.js", "QUICKDEV_COURSE"));
write("sql.json", evaluate("sql-data.js", "QUICKDEV_COURSE"));
write("ai.json", evaluate("ai-data.js", "QUICKDEV_AI_COURSES"));
