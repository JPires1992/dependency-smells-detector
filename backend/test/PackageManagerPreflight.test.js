import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PackageManagerPreflight } from "../src/detectors/dirty-waters/PackageManagerPreflight.js";

/** Verifies that Windows package-manager shims are generated when a command is available. */
test("PackageManagerPreflight creates a Windows-compatible npm shim when running on Windows", async (t) => {
  if (process.platform !== "win32") {
    t.skip("Windows-specific package manager shim test.");
    return;
  }

  const directory = await mkdtemp(path.join(os.tmpdir(), "dw-preflight-"));
  try {
    const preflight = new PackageManagerPreflight({
      shimRootDirectory: path.join(directory, "dirty-waters-bin")
    });
    const env = await preflight.prepareEnvironment({
      packageManager: "npm",
      env: process.env,
      cwd: directory
    });
    const [runDirectory] = await readdir(path.join(directory, "dirty-waters-bin"));
    const generatedDirectory = path.join(directory, "dirty-waters-bin", runDirectory);
    const shimPath = path.join(generatedDirectory, "npm.cmd");
    const patchPath = path.join(generatedDirectory, "sitecustomize.py");
    const shim = await readFile(shimPath, "utf8");
    const patch = await readFile(patchPath, "utf8");

    assert.match(env.PATH, /dirty-waters-bin/);
    assert.match(env.PYTHONPATH, /dirty-waters-bin/);
    assert.match(shim, /call ".+npm\.cmd" %\*/i);
    assert.match(patch, /subprocess\.Popen = _PatchedPopen/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
