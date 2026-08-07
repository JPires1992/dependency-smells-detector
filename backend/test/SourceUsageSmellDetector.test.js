import test from "node:test";
import assert from "node:assert/strict";
import { SourceUsageSmellDetector } from "../src/detectors/source-usage/SourceUsageSmellDetector.js";

/** Verifies exact-ref materialization, result aggregation, and workspace cleanup. */
test("SourceUsageSmellDetector coordinates adapter modules and always cleans its lease", async () => {
  let cleaned = false;
  const detector = new SourceUsageSmellDetector({
    workspaceProvider: {
      async materialize(input) {
        assert.deepEqual(input, {
          repository: "owner/app",
          ref: "main",
          token: "token"
        });
        return {
          directory: "temporary-project",
          async cleanup() {
            cleaned = true;
          }
        };
      }
    },
    analyzer: {
      async analyze({ projectDirectory }) {
        assert.equal(projectDirectory, "temporary-project");
        return { report: { issues: [] }, warnings: ["adapter warning"] };
      }
    },
    parser: {
      parse() {
        return { findings: [{ type: "Unused Dependency" }], warnings: ["parser warning"] };
      }
    }
  });

  const result = await detector.detect({
    project: { repository: "owner/app", analysedRef: "main" },
    manifests: { packageJsonStatus: "present" },
    githubToken: "token"
  });

  assert.equal(cleaned, true);
  assert.equal(result.findings.length, 1);
  assert.deepEqual(result.warnings, ["adapter warning", "parser warning"]);
});

/** Verifies source analysis is skipped cleanly when the project manifest is unavailable. */
test("SourceUsageSmellDetector skips unavailable package manifests", async () => {
  const detector = new SourceUsageSmellDetector({
    workspaceProvider: {
      async materialize() {
        throw new Error("must not run");
      }
    }
  });

  const result = await detector.detect({ manifests: { packageJsonStatus: "unavailable" } });

  assert.deepEqual(result.findings, []);
  assert.match(result.warnings[0], /package\.json was unavailable/);
});
