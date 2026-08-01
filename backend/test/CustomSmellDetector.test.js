import test from "node:test";
import assert from "node:assert/strict";
import { CustomSmellDetector } from "../src/detectors/custom/CustomSmellDetector.js";
import {
  ConstraintKind,
  NpmDependencySpecifierParser,
  SpecifierSource
} from "../src/detectors/custom/NpmDependencySpecifierParser.js";
import { collectManifestDependencies } from "../src/detectors/custom/ManifestDependencyCollector.js";
import { SmellTypes } from "../src/domain/SmellCatalog.js";

/** Verifies npm registry constraints against the dependency-smell SemVer strategy. */
test("NpmDependencySpecifierParser classifies version constraints", () => {
  const parser = new NpmDependencySpecifierParser();

  assert.equal(parser.parse("pkg", "1.2.3").constraintKind, ConstraintKind.PINNED);
  assert.equal(parser.parse("pkg", "0.2.3").constraintKind, ConstraintKind.COMPATIBLE);
  assert.equal(parser.parse("pkg", "^1.2.3").constraintKind, ConstraintKind.COMPATIBLE);
  assert.equal(parser.parse("pkg", "~1.2.3").constraintKind, ConstraintKind.RESTRICTIVE);
  assert.equal(parser.parse("pkg", "1.2.x").constraintKind, ConstraintKind.RESTRICTIVE);
  assert.equal(parser.parse("pkg", "<2.0.0").constraintKind, ConstraintKind.RESTRICTIVE);
  assert.equal(parser.parse("pkg", "<=25.0.0").constraintKind, ConstraintKind.RESTRICTIVE);
  assert.equal(parser.parse("pkg", "<=0.5.0").constraintKind, ConstraintKind.RESTRICTIVE);
  assert.equal(
    parser.parse("pkg", ">=1.2.3 <2.0.0-0").constraintKind,
    ConstraintKind.COMPATIBLE
  );
  assert.equal(parser.parse("pkg", ">=1.2.3").constraintKind, ConstraintKind.PERMISSIVE);
  assert.equal(parser.parse("pkg", "*").constraintKind, ConstraintKind.PERMISSIVE);
  assert.equal(parser.parse("pkg", "latest").constraintKind, ConstraintKind.PERMISSIVE);
  assert.equal(parser.parse("pkg", "^0.2.3").constraintKind, ConstraintKind.PERMISSIVE);
});

/** Verifies that URL, local, workspace, and alias specs remain distinct detection inputs. */
test("NpmDependencySpecifierParser classifies npm dependency sources", () => {
  const parser = new NpmDependencySpecifierParser();

  assert.equal(parser.parse("pkg", "https://example.com/pkg.tgz").source, SpecifierSource.URL);
  assert.equal(parser.parse("pkg", "github:owner/repo").source, SpecifierSource.URL);
  assert.equal(parser.parse("pkg", "git+ssh://git@github.com/owner/repo.git").source, SpecifierSource.URL);
  assert.equal(parser.parse("pkg", "file:../pkg").source, SpecifierSource.LOCAL);
  assert.equal(parser.parse("pkg", "workspace:*").source, SpecifierSource.WORKSPACE);
  assert.equal(parser.parse("pkg", "npm:other@^1.0.0").source, SpecifierSource.ALIAS);
});

/** Verifies section precedence and dependency scope normalization for duplicate declarations. */
test("collectManifestDependencies returns unique declarations with production precedence", () => {
  const dependencies = collectManifestDependencies({
    devDependencies: {
      shared: "^1.0.0",
      testOnly: "^2.0.0"
    },
    dependencies: {
      shared: "^1.1.0",
      runtime: "^3.0.0"
    },
    optionalDependencies: {
      runtime: "^3.1.0"
    },
    peerDependencies: {
      peerOnly: ">=18"
    }
  });

  assert.deepEqual(dependencies, [
    {
      name: "shared",
      constraint: "^1.1.0",
      section: "dependencies",
      dependencyType: "production"
    },
    {
      name: "testOnly",
      constraint: "^2.0.0",
      section: "devDependencies",
      dependencyType: "development"
    },
    {
      name: "runtime",
      constraint: "^3.1.0",
      section: "optionalDependencies",
      dependencyType: "production"
    }
  ]);
});

/** Verifies all initial custom smells and exact resolved-version evidence in one manifest analysis. */
test("CustomSmellDetector detects manifest constraints and a confirmed missing npm lockfile", async () => {
  const detector = new CustomSmellDetector();
  const graph = {
    nodes: [
      { id: "root", name: "sample-app", version: "1.0.0", dependencyType: "root", depth: 0 },
      { id: "pinned@1.2.3", name: "pinned", version: "1.2.3", dependencyType: "production", depth: 1 },
      { id: "url-dep@2.0.0", name: "url-dep", version: "2.0.0", dependencyType: "production", depth: 1 },
      { id: "restricted@3.4.5", name: "restricted", version: "3.4.5", dependencyType: "production", depth: 1 },
      { id: "permissive@4.0.0", name: "permissive", version: "4.0.0", dependencyType: "development", depth: 1 },
      { id: "compatible@5.0.0", name: "compatible", version: "5.0.0", dependencyType: "production", depth: 1 }
    ],
    edges: [
      { source: "root", target: "pinned@1.2.3", relationship: "direct" },
      { source: "root", target: "url-dep@2.0.0", relationship: "direct" },
      { source: "root", target: "restricted@3.4.5", relationship: "direct" },
      { source: "root", target: "permissive@4.0.0", relationship: "direct" },
      { source: "root", target: "compatible@5.0.0", relationship: "direct" }
    ]
  };
  const result = await detector.detect({
    project: {
      name: "sample-app",
      repository: "owner/sample-app",
      analysedRef: "main"
    },
    graph,
    manifests: {
      packageJsonStatus: "present",
      packageJson: {
        name: "sample-app",
        version: "1.0.0",
        dependencies: {
          pinned: "1.2.3",
          "url-dep": "github:owner/url-dep",
          restricted: "~3.4.5",
          compatible: "^5.0.0"
        },
        devDependencies: {
          permissive: ">=4.0.0"
        }
      },
      packageLock: null,
      lockfileStatus: "missing",
      checkedLockfilePaths: ["package-lock.json", "npm-shrinkwrap.json"]
    }
  });

  assert.deepEqual(
    result.findings.map((finding) => finding.type),
    [
      SmellTypes.PERMISSIVE_CONSTRAINT,
      SmellTypes.PINNED_DEPENDENCY,
      SmellTypes.HARDCODED_URL,
      SmellTypes.RESTRICTIVE_CONSTRAINT,
      SmellTypes.NO_PACKAGE_LOCK
    ]
  );
  assert.deepEqual(
    result.findings.slice(0, 4).map((finding) => finding.affectedVersion),
    ["4.0.0", "1.2.3", "2.0.0", "3.4.5"]
  );
  assert.ok(result.findings.every((finding) => finding.detectionSource === "CustomSmellDetector"));
  assert.equal(result.findings[0].evidenceData.dependencySection, "devDependencies");
  assert.equal(result.findings.at(-1).affectedPackage, "sample-app");
  assert.deepEqual(result.warnings, []);
});

/** Verifies that an inconclusive GitHub lookup never becomes a false No Package-Lock smell. */
test("CustomSmellDetector does not report No Package-Lock for unavailable manifests", async () => {
  const detector = new CustomSmellDetector();
  const result = await detector.detect({
    project: { name: "sample-app" },
    graph: { nodes: [], edges: [] },
    manifests: {
      packageJsonStatus: "unavailable",
      lockfileStatus: "unavailable"
    }
  });

  assert.deepEqual(result.findings, []);
  assert.match(result.warnings[0], /package\.json rules were skipped/);
});
