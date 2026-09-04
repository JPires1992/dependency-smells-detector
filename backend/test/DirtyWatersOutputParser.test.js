import test from "node:test";
import assert from "node:assert/strict";
import { DirtyWatersOutputParser } from "../src/detectors/dirty-waters/DirtyWatersOutputParser.js";
import { SmellTypes } from "../src/domain/SmellCatalog.js";

/** Verifies translation from Dirty-Waters JSON fields to normalized smell findings. */
test("DirtyWatersOutputParser maps static result fields to smell findings", () => {
  const parser = new DirtyWatersOutputParser();
  const staticResults = {
    "example-package@1.0.0": {
      parent:
        "[example-app@1.0.0](https://npmjs.com/package/example-app/v/1.0.0)<br>" +
        "    [example-package@1.0.0](https://npmjs.com/package/example-package/v/1.0.0)",
      source_code: {
        github_url: "https://github.com/example/missing",
        github_exists: false,
        archived: true,
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
  };
  const findings = parser.parseStaticResults(staticResults, {
    rootDependencyTypesByName: { "example-package": "production" }
  });
  const packageMetadata = parser.parsePackageMetadata(staticResults);

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
  assert.deepEqual(findings[0].graphContext, {
    nodeId: "example-package@1.0.0",
    depth: 1,
    dependencyType: "production",
    parentNodes: [{
      id: "root",
      name: "example-app",
      version: "1.0.0",
      depth: 0,
      dependencyType: "root"
    }]
  });
  assert.equal(findings[0].evidenceData.graphContext, undefined);
  for (const finding of findings) {
    assert.equal(Object.hasOwn(finding.evidenceData, "parent"), false);
    assert.equal(Object.hasOwn(finding.evidenceData, "rawResultPath"), false);
    assert.equal(Object.hasOwn(finding.evidenceData, "markdownReportPath"), false);
    assert.equal(Object.hasOwn(finding.evidenceData, "rawPackageIdentifier"), false);
  }
  assert.deepEqual(packageMetadata["example-package@1.0.0"], {
    packageName: "example-package",
    packageVersion: "1.0.0",
    archived: true,
    deprecated: true,
    repositoryAvailable: false,
    repositoryUrl: "https://github.com/example/missing",
    metadataSource: "Dirty-Waters"
  });
});
