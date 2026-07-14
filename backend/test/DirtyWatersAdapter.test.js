import test from "node:test";
import assert from "node:assert/strict";
import { DirtyWatersAdapter, parsePositiveInteger } from "../src/detectors/dirty-waters/DirtyWatersAdapter.js";

/** Verifies timeout option parsing for Dirty-Waters CLI and environment overrides. */
test("parsePositiveInteger accepts only positive integer values", () => {
  assert.equal(parsePositiveInteger("3600000", 1000), 3600000);
  assert.equal(parsePositiveInteger("", 1000), 1000);
  assert.equal(parsePositiveInteger("0", 1000), 1000);
  assert.equal(parsePositiveInteger("-1", 1000), 1000);
  assert.equal(parsePositiveInteger("abc", 1000), 1000);
});

/** Verifies that Dirty-Waters uses the package manager present in the project context. */
test("DirtyWatersAdapter passes the project package manager to Dirty-Waters and preflight", async () => {
  const executed = [];
  const adapter = new DirtyWatersAdapter({
    installer: {
      async ensureInstalled() {
        return "dirty-waters";
      }
    },
    packageManagerPreflight: {
      async prepareEnvironment({ packageManager, env }) {
        return { ...env, PREFLIGHT_PACKAGE_MANAGER: packageManager };
      }
    },
    commandRunner: async (command, args, options) => {
      executed.push({ command, args, env: options.env });
      return { exitCode: 0, stdout: "", stderr: "" };
    }
  });

  await adapter.detect({
    project: {
      repository: "owner/repo",
      packageManager: "npm"
    },
    githubToken: "token",
    workspaceDirectory: process.cwd()
  });

  assert.equal(executed[0].command, "dirty-waters");
  assert.equal(executed[0].args[executed[0].args.indexOf("-pm") + 1], "npm");
  assert.equal(executed[0].env.PREFLIGHT_PACKAGE_MANAGER, "npm");
});
