import test from "node:test";
import assert from "node:assert/strict";
import { projectSmellsOntoGraph } from "../src/analysis/GraphSmellProjection.js";

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
      graphContext: {
        depth: 2,
        dependencyType: "development",
        parentNodes: [{
          id: "parent@2.0.0",
          name: "parent",
          version: "2.0.0",
          depth: 1,
          dependencyType: "development"
        }]
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
      graphContext: {
        depth: 1,
        dependencyType: "production",
        parentNodes: [{
          id: "root",
          name: "root-app",
          version: "0.0.0",
          depth: 0,
          dependencyType: "root"
        }]
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
      graphContext: {
        nodeId: "root",
        depth: 0,
        dependencyType: "root",
        parentNodes: []
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

/** Verifies that a reduced graph is enriched from normalized detector metadata. */
test("projectSmellsOntoGraph enriches existing parent edges with detector metadata", () => {
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
      graphContext: {
        depth: 2,
        dependencyType: "production",
        parentNodes: [{
          id: "parent@2.0.0",
          name: "parent",
          version: "2.0.0",
          depth: 1,
          dependencyType: "production"
        }]
      }
    }
  ];

  const projected = projectSmellsOntoGraph(graph, smells);

  assert.equal(projected.nodes.find((node) => node.id === "parent@2.0.0").dependencyType, "production");
  assert.equal(projected.nodes.find((node) => node.id === "parent@2.0.0").depth, 1);
  assert.equal(projected.edges[0].relationship, "transitive");
});

/** Verifies that normalized production context determines the projected package depth. */
test("projectSmellsOntoGraph keeps normalized production evidence depth", () => {
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
      graphContext: {
        depth: 3,
        dependencyType: "production",
        parentNodes: [{
          id: "prod-middle@1.0.0",
          name: "prod-middle",
          version: "1.0.0",
          depth: 2,
          dependencyType: "production"
        }]
      }
    }
  ];

  const projected = projectSmellsOntoGraph(graph, smells);
  const debugNode = projected.nodes.find((node) => node.id === "debug@4.4.3");

  assert.equal(debugNode.dependencyType, "production");
  assert.equal(debugNode.depth, 3);
});

/** Verifies undeclared imports become synthetic direct nodes even when a transitive package exists. */
test("projectSmellsOntoGraph projects missing dependencies from explicit graph context", () => {
  const graph = {
    nodes: [
      { id: "root", name: "app", version: "1.0.0", dependencyType: "root", depth: 0 },
      { id: "missing@0.5.0", name: "missing", version: "0.5.0", dependencyType: "production", depth: 3 }
    ],
    edges: []
  };
  const smells = [{
    id: "SMELL-005",
    affectedPackage: "missing",
    affectedVersion: null,
    score: { finalRating: "Medium" },
    graphContext: {
      synthetic: true,
      depth: 1,
      dependencyType: "unknown",
      parentNodeIds: ["root"]
    }
  }];

  const projected = projectSmellsOntoGraph(graph, smells);

  assert.deepEqual(projected.nodes.find((node) => node.id === "missing"), {
    id: "missing",
    name: "missing",
    version: null,
    dependencyType: "unknown",
    depth: 1,
    hasSmells: true,
    highestSeverity: "Medium"
  });
  assert.ok(projected.nodes.find((node) => node.id === "root"));
  assert.deepEqual(projected.edges, [{
    source: "root",
    target: "missing",
    relationship: "direct",
    smellIds: ["SMELL-005"]
  }]);
});
