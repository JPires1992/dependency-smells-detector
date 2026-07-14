import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PackageLockGraphExtractor } from "../src/analysis/PackageLockGraphExtractor.js";

/** Verifies npm lockfile graph extraction for production, transitive, and dev dependencies. */
test("PackageLockGraphExtractor extracts npm package-lock nodes and edges", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dsmells-"));
  try {
    const packageJson = {
      name: "sample-app",
      version: "1.0.0",
      dependencies: { react: "^18.2.0" },
      devDependencies: { vite: "^5.0.0" }
    };
    const packageLock = {
      name: "sample-app",
      version: "1.0.0",
      lockfileVersion: 3,
      packages: {
        "": {
          name: "sample-app",
          version: "1.0.0",
          dependencies: { react: "^18.2.0" },
          devDependencies: { vite: "^5.0.0" }
        },
        "node_modules/react": {
          version: "18.2.0",
          dependencies: { "loose-envify": "^1.1.0" }
        },
        "node_modules/loose-envify": {
          version: "1.4.0"
        },
        "node_modules/vite": {
          version: "5.0.0",
          dev: true
        }
      }
    };

    await writeFile(path.join(directory, "package-lock.json"), JSON.stringify(packageLock), "utf8");
    const graph = await new PackageLockGraphExtractor().extract(directory, packageJson);

    assert.ok(graph.nodes.find((node) => node.id === "react@18.2.0"));
    assert.ok(graph.nodes.find((node) => node.id === "vite@5.0.0" && node.dependencyType === "development"));
    assert.ok(graph.nodes.find((node) => node.id === "react@18.2.0" && node.depth === 1));
    assert.ok(graph.nodes.find((node) => node.id === "loose-envify@1.4.0" && node.depth === 2));
    assert.ok(graph.edges.find((edge) => edge.source === "root" && edge.target === "react@18.2.0" && edge.relationship === "direct"));
    assert.ok(graph.edges.find((edge) => edge.source === "root" && edge.target === "vite@5.0.0" && edge.relationship === "direct"));
    assert.ok(graph.edges.find((edge) => edge.source === "react@18.2.0" && edge.target === "loose-envify@1.4.0"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

/** Verifies that optional and peer dependency relationships contribute to graph depth. */
test("PackageLockGraphExtractor resolves peer and optional dependency depths", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dsmells-"));
  try {
    const packageJson = {
      name: "sample-app",
      version: "1.0.0",
      devDependencies: { vite: "^7.0.0" }
    };
    const packageLock = {
      name: "sample-app",
      version: "1.0.0",
      lockfileVersion: 3,
      packages: {
        "": {
          name: "sample-app",
          version: "1.0.0",
          devDependencies: { vite: "^7.0.0" }
        },
        "node_modules/vite": {
          version: "7.0.0",
          dev: true,
          peerDependencies: { lightningcss: "^1.30.0" },
          peerDependenciesMeta: { lightningcss: { optional: true } }
        },
        "node_modules/lightningcss": {
          version: "1.30.2",
          optionalDependencies: { "lightningcss-linux-x64-gnu": "1.30.2" }
        },
        "node_modules/lightningcss-linux-x64-gnu": {
          version: "1.30.2",
          optional: true
        }
      }
    };

    await writeFile(path.join(directory, "package-lock.json"), JSON.stringify(packageLock), "utf8");
    const graph = await new PackageLockGraphExtractor().extract(directory, packageJson);

    assert.ok(graph.edges.find((edge) => edge.source === "vite@7.0.0" && edge.target === "lightningcss@1.30.2"));
    assert.ok(graph.edges.find((edge) => edge.source === "lightningcss@1.30.2" && edge.target === "lightningcss-linux-x64-gnu@1.30.2"));
    assert.ok(
      graph.nodes.find(
        (node) =>
          node.id === "lightningcss-linux-x64-gnu@1.30.2" &&
          node.depth === 3 &&
          node.dependencyType === "development"
      )
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
