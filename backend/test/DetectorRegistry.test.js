import test from "node:test";
import assert from "node:assert/strict";
import { DetectorRegistry } from "../src/detectors/DetectorRegistry.js";

/** Verifies detector package metadata is merged independently from smell findings. */
test("DetectorRegistry aggregates package-level metadata by exact package id", async () => {
  const registry = new DetectorRegistry([
    {
      async detect() {
        return {
          findings: [],
          warnings: [],
          packageMetadata: {
            "sample@1.0.0": { archived: false, metadataSource: "first" }
          }
        };
      }
    },
    {
      async detect() {
        return {
          findings: [],
          warnings: [],
          packageMetadata: {
            "sample@1.0.0": { deprecated: true, metadataSource: "second" }
          }
        };
      }
    }
  ]);

  const result = await registry.detect({});

  assert.deepEqual(result.packageMetadata["sample@1.0.0"], {
    archived: false,
    deprecated: true,
    metadataSource: "second"
  });
});

/** Verifies optional detector diagnostics do not leak into report-facing warnings. */
test("DetectorRegistry separates optional detector warnings from runtime diagnostics", async () => {
  const registry = new DetectorRegistry([
    {
      name: "ExternalDetector",
      required: false,
      async detect() {
        const error = new Error("External tool failed with exit code 1.");
        error.diagnostic = "Detailed stack trace";
        throw error;
      }
    }
  ]);

  const result = await registry.detect({});

  assert.deepEqual(result.warnings, [
    "ExternalDetector skipped: External tool failed with exit code 1."
  ]);
  assert.deepEqual(result.runtimeDiagnostics, [
    "ExternalDetector diagnostic:\nDetailed stack trace"
  ]);
});
