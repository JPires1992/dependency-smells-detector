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
