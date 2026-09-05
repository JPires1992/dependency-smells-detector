import test from "node:test";
import assert from "node:assert/strict";
import { NpmRegistryMetadataProvider } from "../src/detectors/peer-spin/NpmRegistryMetadataProvider.js";
import { NodeReplacementConflictDetector } from "../src/detectors/peer-spin/NodeReplacementConflictDetector.js";
import { PeerDependencyModelBuilder } from "../src/detectors/peer-spin/PeerDependencyModelBuilder.js";
import { PeerSpinDetector } from "../src/detectors/peer-spin/PeerSpinDetector.js";
import { SmellTypes } from "../src/domain/SmellCatalog.js";
import { resolveConfiguration } from "../src/configuration/ConfigurationLoader.js";

const TEST_CONFIGURATION = resolveConfiguration();

/** Creates the paper's Peer-to-Regular pattern with incompatible B requirements. */
function createPeerToRegularLockfile(peerRange = "^1.0.0") {
  return {
    name: "app",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "app",
        version: "1.0.0",
        dependencies: { a: "1.0.0" }
      },
      "node_modules/a": {
        version: "1.0.0",
        dependencies: { b: "^2.0.0" }
      },
      "node_modules/a/node_modules/b": {
        version: "2.1.0",
        dependencies: { c: "1.0.0" }
      },
      "node_modules/a/node_modules/b/node_modules/c": {
        version: "1.0.0",
        peerDependencies: { b: peerRange }
      }
    }
  };
}

/** Creates the paper's Peer-to-Peer pattern with two C requirements in one peer set. */
function createPeerToPeerLockfile(indirectPeerRange = "^1.0.0") {
  return {
    name: "app",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "app",
        version: "1.0.0",
        dependencies: { a: "1.0.0" }
      },
      "node_modules/a": {
        version: "1.0.0",
        dependencies: { b: "1.0.0" }
      },
      "node_modules/a/node_modules/b": {
        version: "1.0.0",
        peerDependencies: { c: "^2.0.0", d: "^1.0.0" }
      },
      "node_modules/a/node_modules/c": {
        version: "2.1.0"
      },
      "node_modules/a/node_modules/d": {
        version: "1.0.0",
        peerDependencies: { c: indirectPeerRange }
      }
    }
  };
}

/** Builds the internal model used by low-level replacement conflict tests. */
function buildModel(packageLock) {
  return new PeerDependencyModelBuilder().build({
    packageLock,
    packageJson: packageLock.packages[""]
  }).model;
}

/** Verifies exact registry metadata without making network requests. */
function createMetadataProvider(manifestsById) {
  return {
    async getVersionManifest(name, version) {
      const manifest = manifestsById[`${name}@${version}`];
      if (!manifest) {
        throw new Error(`Missing test manifest for ${name}@${version}.`);
      }
      return manifest;
    }
  };
}

/** Verifies path-sensitive regular and peer relationships retained from package-lock.json. */
test("PeerDependencyModelBuilder retains dependency kinds, ranges, and peer providers", () => {
  const model = buildModel(createPeerToRegularLockfile());
  const peerRequirement = model.peerRequirements[0];

  assert.equal(model.regularEdges.length, 3);
  assert.equal(peerRequirement.sourcePath, "node_modules/a/node_modules/b/node_modules/c");
  assert.equal(peerRequirement.targetName, "b");
  assert.equal(peerRequirement.range, "^1.0.0");
  assert.equal(peerRequirement.providerPath, "node_modules/a/node_modules/b");
});

/** Verifies detection of the minimal Peer-to-Regular node replacement cycle. */
test("NodeReplacementConflictDetector detects Peer-to-Regular conflicts", () => {
  const result = new NodeReplacementConflictDetector(TEST_CONFIGURATION.peerSpin).detect(
    buildModel(createPeerToRegularLockfile())
  );

  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].pattern, "Peer-to-Regular");
  assert.equal(result.conflicts[0].peerSource.id, "a@1.0.0");
  assert.equal(result.conflicts[0].peerEntry.id, "b@2.1.0");
  assert.deepEqual(
    result.conflicts[0].replacementCycle.map((step) => step.requiredRange),
    ["^2.0.0", "^1.0.0", "^2.0.0"]
  );
});

/** Verifies detection of incompatible peer requirements reached through one peer set. */
test("NodeReplacementConflictDetector detects Peer-to-Peer conflicts", () => {
  const result = new NodeReplacementConflictDetector(TEST_CONFIGURATION.peerSpin).detect(
    buildModel(createPeerToPeerLockfile())
  );

  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].pattern, "Peer-to-Peer");
  assert.equal(result.conflicts[0].conflictingPackage, "c");
  assert.deepEqual(
    result.conflicts[0].requirements.map((requirement) => requirement.range),
    ["^2.0.0", "^1.0.0"]
  );
});

/** Verifies compatible peer ranges and optional peer requirements are not classified as PeerSpin. */
test("NodeReplacementConflictDetector ignores compatible and optional peer requirements", () => {
  const compatibleModel = buildModel(createPeerToPeerLockfile("^2.1.0"));
  const optionalLock = createPeerToRegularLockfile();
  optionalLock.packages["node_modules/a/node_modules/b/node_modules/c"].peerDependenciesMeta = {
    b: { optional: true }
  };

  assert.deepEqual(
    new NodeReplacementConflictDetector(TEST_CONFIGURATION.peerSpin).detect(compatibleModel).conflicts,
    []
  );
  assert.deepEqual(
    new NodeReplacementConflictDetector(TEST_CONFIGURATION.peerSpin).detect(buildModel(optionalLock)).conflicts,
    []
  );
});

/** Verifies candidate confirmation and normalized finding generation through the full detector. */
test("PeerSpinDetector emits only registry-confirmed replacement conflicts", async () => {
  const packageLock = createPeerToRegularLockfile();
  const detector = new PeerSpinDetector({
    ...TEST_CONFIGURATION.peerSpin,
    conflictDetector: new NodeReplacementConflictDetector(TEST_CONFIGURATION.peerSpin),
    metadataProvider: createMetadataProvider({
      "a@1.0.0": {
        name: "a",
        version: "1.0.0",
        dependencies: { b: "^2.0.0" }
      },
      "c@1.0.0": {
        name: "c",
        version: "1.0.0",
        peerDependencies: { b: "^1.0.0" }
      }
    })
  });

  const result = await detector.detect({
    project: { name: "app", packageManager: "npm" },
    manifests: {
      packageJson: packageLock.packages[""],
      packageLock,
      lockfileStatus: "present"
    }
  });

  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].type, SmellTypes.PEER_DEPENDENCY_RESOLVING_LOOP);
  assert.equal(result.findings[0].affectedPackage, "a");
  assert.equal(result.findings[0].affectedVersion, "1.0.0");
  assert.equal(result.findings[0].evidenceData.pattern, "Peer-to-Regular");
  assert.equal(result.findings[0].evidenceData.registryVerificationStatus, "verified");
  assert.deepEqual(result.warnings, []);
});

/** Verifies stale or divergent registry declarations suppress lockfile-only candidates. */
test("PeerSpinDetector rejects candidates not confirmed by registry metadata", async () => {
  const packageLock = createPeerToRegularLockfile();
  const detector = new PeerSpinDetector({
    ...TEST_CONFIGURATION.peerSpin,
    conflictDetector: new NodeReplacementConflictDetector(TEST_CONFIGURATION.peerSpin),
    metadataProvider: createMetadataProvider({
      "a@1.0.0": {
        name: "a",
        version: "1.0.0",
        dependencies: { b: "^2.0.0" }
      },
      "c@1.0.0": {
        name: "c",
        version: "1.0.0",
        peerDependencies: { b: "^2.0.0" }
      }
    })
  });

  const result = await detector.detect({
    project: { name: "app", packageManager: "npm" },
    manifests: {
      packageJson: packageLock.packages[""],
      packageLock,
      lockfileStatus: "present"
    }
  });

  assert.deepEqual(result.findings, []);
  assert.match(result.warnings[0], /was not emitted/);
});

/** Verifies mandatory PeerSpin analysis fails when registry evidence is unavailable. */
test("PeerSpinDetector enforces registry verification when required", async () => {
  const packageLock = createPeerToRegularLockfile();
  const detector = new PeerSpinDetector({
    ...TEST_CONFIGURATION.peerSpin,
    conflictDetector: new NodeReplacementConflictDetector(TEST_CONFIGURATION.peerSpin),
    required: true,
    metadataProvider: createMetadataProvider({})
  });

  await assert.rejects(
    detector.detect({
      project: { name: "app", packageManager: "npm" },
      manifests: {
        packageJson: packageLock.packages[""],
        packageLock,
        lockfileStatus: "present"
      }
    }),
    /could not be verified/
  );
});

/** Verifies exact manifest requests, authentication, and in-memory request deduplication. */
test("NpmRegistryMetadataProvider caches exact authenticated manifest requests", async () => {
  const requests = [];
  const provider = new NpmRegistryMetadataProvider({
    ...TEST_CONFIGURATION.npmRegistry,
    registryUrl: "https://registry.example.test/",
    token: "registry-token",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ name: "@scope/pkg", version: "1.2.3" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
  });

  const [first, second] = await Promise.all([
    provider.getVersionManifest("@scope/pkg", "1.2.3"),
    provider.getVersionManifest("@scope/pkg", "1.2.3")
  ]);

  assert.equal(first, second);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://registry.example.test/%40scope%2Fpkg/1.2.3");
  assert.equal(requests[0].options.headers.Authorization, "Bearer registry-token");
});
