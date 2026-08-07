import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { KnipAdapter, parseKnipJsonReport } from "../src/detectors/source-usage/KnipAdapter.js";

/** Creates and later removes an isolated npm project that exercises Knip issue types. */
async function createSourceUsageFixture(t) {
  const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "source-usage-fixture-"));
  await mkdir(path.join(projectDirectory, "src"), { recursive: true });
  await Promise.all([
    writeFile(
      path.join(projectDirectory, "package.json"),
      `${JSON.stringify({
        name: "source-usage-fixture",
        version: "1.0.0",
        private: true,
        type: "module",
        main: "src/index.ts",
        dependencies: {
          "used-package": "^1.0.0",
          "unused-package": "^2.0.0"
        },
        devDependencies: {
          "@vitejs/plugin-react": "^5.1.1",
          "unused-dev-package": "^3.0.0",
          vite: "^7.2.4"
        },
        optionalDependencies: {
          "unused-optional-package": "^4.0.0"
        }
      }, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(projectDirectory, "src", "index.ts"),
      'import "used-package";\nimport "missing-package";\n',
      "utf8"
    ),
    writeFile(
      path.join(projectDirectory, "vite.config.ts"),
      'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()] });\n',
      "utf8"
    )
  ]);
  t.after(async () => {
    await rm(projectDirectory, { recursive: true, force: true });
  });
  return projectDirectory;
}

/** Verifies strict parsing of the Knip JSON reporter contract. */
test("parseKnipJsonReport validates the issues array", () => {
  assert.deepEqual(parseKnipJsonReport('{"issues":[]}'), { issues: [] });
  assert.throws(() => parseKnipJsonReport("not-json"), /invalid JSON/);
  assert.throws(() => parseKnipJsonReport("{}"), /issues array/);
});

/** Verifies process isolation, dependency-only arguments, and temporary config cleanup. */
test("KnipAdapter executes dependency-only analysis with a static temporary config", async (t) => {
  const temporaryRootDirectory = await mkdtemp(path.join(os.tmpdir(), "knip-adapter-test-"));
  t.after(async () => {
    await rm(temporaryRootDirectory, { recursive: true, force: true });
  });
  const projectDirectory = await createSourceUsageFixture(t);
  let configPath = null;
  const adapter = new KnipAdapter({
    temporaryRootDirectory,
    knipCliPath: "C:\\tools\\knip.js",
    commandRunner: async (command, args, options) => {
      configPath = args[2];
      assert.equal(command, process.execPath);
      assert.deepEqual(args.slice(3), [
        "--directory",
        projectDirectory,
        "--workspace",
        ".",
        "--include",
        "dependencies,unlisted",
        "--reporter",
        "json",
        "--no-progress",
        "--no-config-hints",
        "--no-exit-code"
      ]);
      assert.equal(options.cwd, projectDirectory);
      await access(configPath);
      assert.deepEqual(JSON.parse(await readFile(configPath, "utf8")), {
        vite: {
          config: [],
          entry: ["vite.config.{js,mjs,ts,cjs,mts,cts}"]
        }
      });
      return { exitCode: 0, stdout: '{"issues":[]}', stderr: "" };
    }
  });

  const result = await adapter.analyze({ projectDirectory });

  assert.deepEqual(result, { report: { issues: [] }, warnings: [] });
  await assert.rejects(() => access(configPath));
});

/** Verifies that a zero exit code cannot hide incomplete Knip configuration analysis. */
test("KnipAdapter rejects reports accompanied by fatal diagnostics", async () => {
  const adapter = new KnipAdapter({
    commandRunner: async () => ({
      exitCode: 0,
      stdout: '{"issues":[]}',
      stderr: "ERROR: Error loading vite.config.js (Cannot find module 'vite')\n"
    })
  });

  await assert.rejects(
    () => adapter.analyze({ projectDirectory: process.cwd() }),
    /Knip analysis was incomplete: ERROR: Error loading vite\.config\.js/
  );
});

/** Verifies the installed Knip version against a real source fixture without node_modules. */
test("KnipAdapter reports unused and unlisted fixture dependencies", async (t) => {
  const projectDirectory = await createSourceUsageFixture(t);
  const result = await new KnipAdapter().analyze({ projectDirectory });
  const packageIssues = result.report.issues.find((issue) => issue.file === "package.json");
  const sourceIssues = result.report.issues.find((issue) => issue.file === "src/index.ts");

  assert.deepEqual(packageIssues.dependencies.map((issue) => issue.name), ["unused-package"]);
  assert.deepEqual(packageIssues.devDependencies.map((issue) => issue.name), ["unused-dev-package"]);
  assert.deepEqual(sourceIssues.unlisted.map((issue) => issue.name), ["missing-package"]);
  assert.deepEqual(result.warnings, []);
});
