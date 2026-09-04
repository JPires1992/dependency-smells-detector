import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { DirtyWatersAdapter } from "../src/detectors/dirty-waters/DirtyWatersAdapter.js";

/** Verifies that Dirty-Waters uses the package manager present in the project context. */
test("DirtyWatersAdapter passes the project package manager to Dirty-Waters and preflight", async () => {
  const executed = [];
  const workspaceDirectory = await mkdtemp(path.join(os.tmpdir(), "dirty-waters-adapter-test-"));
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

  try {
    await adapter.detect({
      project: {
        repository: "owner/repo",
        packageManager: "npm"
      },
      githubToken: "token",
      workspaceDirectory
    });

    assert.equal(executed[0].command, "dirty-waters");
    assert.equal(executed[0].args[executed[0].args.indexOf("-pm") + 1], "npm");
    assert.equal(executed[0].env.PREFLIGHT_PACKAGE_MANAGER, "npm");
  } finally {
    await rm(workspaceDirectory, { recursive: true, force: true });
  }
});

/** Verifies generated Dirty-Waters reports are parsed and removed after a successful run. */
test("DirtyWatersAdapter cleans generated result artefacts after parsing", async () => {
  const workspaceDirectory = await mkdtemp(path.join(os.tmpdir(), "dirty-waters-cleanup-test-"));
  const adapter = new DirtyWatersAdapter({
    installer: {
      async ensureInstalled() {
        return "dirty-waters";
      }
    },
    packageManagerPreflight: {
      async prepareEnvironment({ env }) {
        return env;
      }
    },
    commandRunner: async (_command, _args, options) => {
      const artifactDirectory = path.join(
        options.cwd,
        "results",
        "results-current",
        "sscs",
        "commit"
      );
      await mkdir(artifactDirectory, { recursive: true });
      await writeFile(
        path.join(artifactDirectory, "commit_static_results.json"),
        "{}",
        "utf8"
      );
      return { exitCode: 0, stdout: "", stderr: "" };
    }
  });

  try {
    const result = await adapter.detect({
      project: { repository: "owner/repo", packageManager: "npm" },
      githubToken: "token",
      workspaceDirectory
    });

    assert.deepEqual(result.findings, []);
    assert.deepEqual(result.warnings, []);
    assert.equal(result.artifacts, undefined);
    await assert.rejects(
      () => access(path.join(workspaceDirectory, "results")),
      { code: "ENOENT" }
    );
  } finally {
    await rm(workspaceDirectory, { recursive: true, force: true });
  }
});

/** Verifies a successful command without current output never reuses a stale report. */
test("DirtyWatersAdapter rejects stale result artefacts", async () => {
  const workspaceDirectory = await mkdtemp(path.join(os.tmpdir(), "dirty-waters-stale-test-"));
  const staleDirectory = path.join(workspaceDirectory, "results", "results-old", "sscs", "commit");
  const staleResultPath = path.join(staleDirectory, "commit_static_results.json");
  await mkdir(staleDirectory, { recursive: true });
  await writeFile(staleResultPath, "{}", "utf8");
  const staleTimestamp = new Date(Date.now() - 10_000);
  await utimes(staleResultPath, staleTimestamp, staleTimestamp);
  const adapter = new DirtyWatersAdapter({
    installer: {
      async ensureInstalled() {
        return "dirty-waters";
      }
    },
    packageManagerPreflight: {
      async prepareEnvironment({ env }) {
        return env;
      }
    },
    commandRunner: async () => ({ exitCode: 0, stdout: "", stderr: "" })
  });

  try {
    const result = await adapter.detect({
      project: { repository: "owner/repo", packageManager: "npm" },
      githubToken: "token",
      workspaceDirectory
    });

    assert.deepEqual(result.findings, []);
    assert.match(result.warnings[0], /no current .*static_results\.json/i);
    await assert.rejects(
      () => access(path.join(workspaceDirectory, "results")),
      { code: "ENOENT" }
    );
  } finally {
    await rm(workspaceDirectory, { recursive: true, force: true });
  }
});
