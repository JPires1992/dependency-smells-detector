import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDirtyWatersImmediateParents,
  parseDirtyWatersPackageRefs,
  projectSmellsOntoGraph
} from "../src/analysis/GraphSmellProjection.js";

/** Verifies that Dirty-Waters parent evidence yields immediate parents only. */
test("parseDirtyWatersImmediateParents extracts direct parents from dependency paths", () => {
  const parentEvidence =
    "<details><summary>2 paths</summary><pre>" +
    "[frontend@0.0.0](https://npmjs.com/package/frontend/v/0.0.0)<br>" +
    "    [@vitejs/plugin-react@5.1.1](https://npmjs.com/package/@vitejs/plugin-react/v/5.1.1)<br>" +
    "        [@babel/template@7.27.2](https://npmjs.com/package/@babel/template/v/7.27.2)<br>" +
    "            [@babel/code-frame@7.27.1](https://npmjs.com/package/@babel/code-frame/v/7.27.1)<br>" +
    "        [@babel/traverse@7.28.5](https://npmjs.com/package/@babel/traverse/v/7.28.5)<br>" +
    "            [@babel/code-frame@7.27.1](https://npmjs.com/package/@babel/code-frame/v/7.27.1)" +
    "</pre></details>";

  const parents = parseDirtyWatersImmediateParents(
    parentEvidence,
    {
      name: "@babel/code-frame",
      version: "7.27.1"
    },
    { "@vitejs/plugin-react": "development" }
  );

  assert.deepEqual(parents, [
    { name: "@babel/template", version: "7.27.2", depth: 2, dependencyType: "development" },
    { name: "@babel/traverse", version: "7.28.5", depth: 2, dependencyType: "development" }
  ]);
});

/** Verifies that Dirty-Waters tree indentation is converted into graph depth and dependency scope. */
test("parseDirtyWatersPackageRefs infers depth and dependency type from the root dependency", () => {
  const parentEvidence =
    "[frontend@0.0.0](https://npmjs.com/package/frontend/v/0.0.0)<br>" +
    "    [parent@2.0.0](https://npmjs.com/package/parent/v/2.0.0)<br>" +
    "        [child@1.0.0](https://npmjs.com/package/child/v/1.0.0)";

  assert.deepEqual(parseDirtyWatersPackageRefs(parentEvidence, { parent: "development" }), [
    { id: "root", name: "frontend", version: "0.0.0", depth: 0, dependencyType: "root" },
    { name: "parent", version: "2.0.0", depth: 1, dependencyType: "development" },
    { name: "child", version: "1.0.0", depth: 2, dependencyType: "development" }
  ]);
});

/** Verifies that projected graph contains only smelled packages and their immediate parents. */
test("projectSmellsOntoGraph keeps only smell-to-parent relationships", () => {
  const graph = {
    nodes: [{ id: "root", name: "sample-app", version: "1.0.0", dependencyType: "root", depth: 0 }],
    edges: [],
    rootDependencyTypesByName: { parent: "development" }
  };
  const smells = [
    {
      id: "SMELL-001",
      affectedPackage: "child",
      affectedVersion: "1.0.0",
      score: { finalRating: "High" },
      evidenceData: {
        parent:
          "[root-app@0.0.0](https://npmjs.com/package/root-app/v/0.0.0)<br>" +
          "    [parent@2.0.0](https://npmjs.com/package/parent/v/2.0.0)<br>" +
          "        [child@1.0.0](https://npmjs.com/package/child/v/1.0.0)"
      }
    }
  ];

  const projected = projectSmellsOntoGraph(graph, smells);

  assert.deepEqual(
    projected.nodes.map((node) => node.id).sort(),
    ["child@1.0.0", "parent@2.0.0"]
  );
  assert.deepEqual(projected.nodes.find((node) => node.id === "child@1.0.0"), {
    id: "child@1.0.0",
    name: "child",
    version: "1.0.0",
    dependencyType: "development",
    depth: 2,
    hasSmells: true,
    highestSeverity: "High"
  });
  assert.deepEqual(projected.nodes.find((node) => node.id === "parent@2.0.0"), {
    id: "parent@2.0.0",
    name: "parent",
    version: "2.0.0",
    dependencyType: "development",
    depth: 1,
    hasSmells: false,
    highestSeverity: null
  });
  assert.deepEqual(projected.edges, [
    {
      source: "parent@2.0.0",
      target: "child@1.0.0",
      relationship: "transitive",
      smellIds: ["SMELL-001"]
    }
  ]);
});

/** Verifies that direct smelled dependencies are linked from the root node with a direct edge. */
test("projectSmellsOntoGraph marks root-to-smell edges as direct", () => {
  const graph = {
    nodes: [{ id: "root", name: "sample-app", version: "1.0.0", dependencyType: "root", depth: 0 }],
    edges: [],
    rootDependencyTypesByName: { child: "production" }
  };
  const smells = [
    {
      id: "SMELL-002",
      affectedPackage: "child",
      affectedVersion: "1.0.0",
      score: { finalRating: "Medium" },
      evidenceData: {
        parent:
          "[root-app@0.0.0](https://npmjs.com/package/root-app/v/0.0.0)<br>" +
          "    [child@1.0.0](https://npmjs.com/package/child/v/1.0.0)"
      }
    }
  ];

  const projected = projectSmellsOntoGraph(graph, smells);

  assert.deepEqual(projected.nodes.find((node) => node.id === "child@1.0.0"), {
    id: "child@1.0.0",
    name: "child",
    version: "1.0.0",
    dependencyType: "production",
    depth: 1,
    hasSmells: true,
    highestSeverity: "Medium"
  });
  assert.deepEqual(projected.edges, [
    {
      source: "root",
      target: "child@1.0.0",
      relationship: "direct",
      smellIds: ["SMELL-002"]
    }
  ]);
});

/** Verifies that smells on the analysed package reuse the canonical root graph node. */
test("projectSmellsOntoGraph maps analysed package smells to the root node", () => {
  const graph = {
    nodes: [{ id: "root", name: "frontend", version: "0.0.0", dependencyType: "root", depth: 0 }],
    edges: []
  };
  const smells = [
    {
      id: "SMELL-003",
      affectedPackage: "frontend",
      affectedVersion: "0.0.0",
      score: { finalRating: "Medium" },
      evidenceData: {
        parent: "[frontend@0.0.0](https://npmjs.com/package/frontend/v/0.0.0)"
      }
    }
  ];

  const projected = projectSmellsOntoGraph(graph, smells);

  assert.deepEqual(projected.nodes, [
    {
      id: "root",
      name: "frontend",
      version: "0.0.0",
      dependencyType: "root",
      depth: 0,
      hasSmells: true,
      highestSeverity: "Medium"
    }
  ]);
});

/** Verifies that reprojecting an older reduced graph enriches parent metadata from evidence. */
test("projectSmellsOntoGraph enriches existing parent edges with Dirty-Waters metadata", () => {
  const graph = {
    nodes: [
      { id: "child@1.0.0", name: "child", version: "1.0.0", dependencyType: "unknown" },
      { id: "parent@2.0.0", name: "parent", version: "2.0.0", dependencyType: "unknown" }
    ],
    edges: [{ source: "parent@2.0.0", target: "child@1.0.0", relationship: "transitive" }],
    rootDependencyTypesByName: { parent: "production" }
  };
  const smells = [
    {
      id: "SMELL-001",
      affectedPackage: "child",
      affectedVersion: "1.0.0",
      score: { finalRating: "High" },
      evidenceData: {
        parent:
          "[root-app@0.0.0](https://npmjs.com/package/root-app/v/0.0.0)<br>" +
          "    [parent@2.0.0](https://npmjs.com/package/parent/v/2.0.0)<br>" +
          "        [child@1.0.0](https://npmjs.com/package/child/v/1.0.0)"
      }
    }
  ];

  const projected = projectSmellsOntoGraph(graph, smells);

  assert.equal(projected.nodes.find((node) => node.id === "parent@2.0.0").dependencyType, "production");
  assert.equal(projected.nodes.find((node) => node.id === "parent@2.0.0").depth, 1);
  assert.equal(projected.edges[0].relationship, "transitive");
});

/** Verifies that production Dirty-Waters evidence wins over a shorter development path for the same smelled package. */
test("projectSmellsOntoGraph keeps production evidence depth when development evidence is shorter", () => {
  const graph = {
    nodes: [{ id: "root", name: "sample-app", version: "1.0.0", dependencyType: "root", depth: 0 }],
    edges: [],
    rootDependencyTypesByName: {
      "dev-parent": "development",
      "prod-parent": "production"
    }
  };
  const smells = [
    {
      id: "SMELL-004",
      affectedPackage: "debug",
      affectedVersion: "4.4.3",
      score: { finalRating: "Medium" },
      evidenceData: {
        parent:
          "[sample-app@1.0.0](https://npmjs.com/package/sample-app/v/1.0.0)<br>" +
          "    [dev-parent@1.0.0](https://npmjs.com/package/dev-parent/v/1.0.0)<br>" +
          "        [debug@4.4.3](https://npmjs.com/package/debug/v/4.4.3)<br>" +
          "[sample-app@1.0.0](https://npmjs.com/package/sample-app/v/1.0.0)<br>" +
          "    [prod-parent@1.0.0](https://npmjs.com/package/prod-parent/v/1.0.0)<br>" +
          "        [prod-middle@1.0.0](https://npmjs.com/package/prod-middle/v/1.0.0)<br>" +
          "            [debug@4.4.3](https://npmjs.com/package/debug/v/4.4.3)"
      }
    }
  ];

  const projected = projectSmellsOntoGraph(graph, smells);
  const debugNode = projected.nodes.find((node) => node.id === "debug@4.4.3");

  assert.equal(debugNode.dependencyType, "production");
  assert.equal(debugNode.depth, 3);
});
