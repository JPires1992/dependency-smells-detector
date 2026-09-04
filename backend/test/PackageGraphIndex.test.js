import test from "node:test";
import assert from "node:assert/strict";
import { PackageGraphIndex } from "../src/analysis/PackageGraphIndex.js";

/** Creates a graph with repeated package names for identity-resolution tests. */
function createGraph() {
  return {
    nodes: [
      { id: "root", name: "app", version: "1.0.0" },
      { id: "sample@1.0.0", name: "sample", version: "1.0.0" },
      { id: "sample@2.0.0", name: "sample", version: "2.0.0" },
      { id: "unique@3.0.0", name: "unique", version: "3.0.0" }
    ],
    edges: [
      { source: "root", target: "sample@1.0.0", relationship: "direct" },
      { source: "sample@1.0.0", target: "sample@2.0.0", relationship: "transitive" }
    ]
  };
}

/** Verifies exact package coordinates and explicit ids resolve deterministically. */
test("PackageGraphIndex resolves explicit and exact package identities", () => {
  const index = new PackageGraphIndex(createGraph());

  assert.equal(index.resolve({ nodeId: "root" })?.id, "root");
  assert.equal(
    index.resolve({ name: "sample", version: "2.0.0" })?.id,
    "sample@2.0.0"
  );
  assert.equal(index.resolveDirectDependency("sample")?.id, "sample@1.0.0");
});

/** Verifies name-only and incorrect-version lookups never select arbitrary nodes. */
test("PackageGraphIndex rejects ambiguous or unavailable package identities", () => {
  const index = new PackageGraphIndex(createGraph());

  assert.equal(index.resolve({ name: "sample" }), null);
  assert.equal(index.resolve({ name: "sample", version: "3.0.0" }), null);
  assert.equal(index.resolve({ name: "unique" })?.id, "unique@3.0.0");
});

/** Verifies internal finding ids disambiguate project-root findings. */
test("PackageGraphIndex prioritizes an explicit finding node id", () => {
  const graph = createGraph();
  graph.nodes.push({ id: "app@1.0.0", name: "app", version: "1.0.0" });
  const index = new PackageGraphIndex(graph);

  assert.equal(index.resolve({ name: "app", version: "1.0.0" }), null);
  assert.equal(index.resolveFinding({
    affectedPackage: "app",
    affectedVersion: "1.0.0",
    graphContext: { nodeId: "root" }
  })?.id, "root");
});
