import test from "node:test";
import assert from "node:assert/strict";
import { DirtyWatersOutputParser } from "../src/detectors/dirty-waters/DirtyWatersOutputParser.js";
import { SmellTypes } from "../src/domain/smellCatalog.js";

/** Verifies translation from Dirty-Waters JSON fields to normalized smell findings. */
test("DirtyWatersOutputParser maps static result fields to smell findings", () => {
  const parser = new DirtyWatersOutputParser();
  const findings = parser.parseStaticResults({
    "example-package@1.0.0": {
      source_code: {
        github_url: "https://github.com/example/missing",
        github_exists: false,
        source_code_version: {
          exists: false
        }
      },
      package_info: {
        deprecated_in_version: true,
        provenance_in_version: false
      },
      code_signature: {
        signature_present: true,
        signature_valid: false
      }
    }
  });

  assert.deepEqual(
    findings.map((finding) => finding.type),
    [
      SmellTypes.INVALID_SOURCE_CODE_URL,
      SmellTypes.DEPRECATED,
      SmellTypes.NO_PROVENANCE,
      SmellTypes.INVALID_CODE_SIGNATURE
    ]
  );
  assert.equal(findings[0].affectedPackage, "example-package");
  assert.equal(findings[0].affectedVersion, "1.0.0");
});
