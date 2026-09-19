import { expect, test } from "vitest";
import {
  buildVisibleStats,
  filterGraph,
  normalizeAnalysisResult,
  SEVERITIES
} from "../src/analysisResult.js";
import { createAnalysisDocument } from "./analysisFixture.js";

/** Creates filter Sets using every known severity and the requested smell types. */
function createFilters(smellTypes, severities = SEVERITIES) {
  return {
    severities: new Set(severities),
    smellTypes: new Set(smellTypes)
  };
}

/** Verifies normalization associates findings, preserves backend summary data, and sorts smell types. */
test("normalizeAnalysisResult builds the frontend view model", () => {
  const analysis = normalizeAnalysisResult(createAnalysisDocument());
  const urlNode = analysis.graph.nodes.find((node) => node.id === "url-package@2.0.0");

  expect(urlNode.hasSmells).toBe(true);
  expect(urlNode.smells.map((smell) => smell.id)).toEqual(["SMELL-001", "SMELL-002"]);
  expect(analysis.smellTypes).toEqual(["Deprecated", "No Provenance", "URL Dependency"]);
  expect(analysis.summary).toEqual({
    dependenciesAnalysed: 4,
    smellsDetected: 3,
    severityCounts: {
      Critical: 0,
      High: 1,
      Medium: 1,
      Low: 1
    }
  });
});

/** Verifies older documents without summary data receive totals derived from their projected graph. */
test("normalizeAnalysisResult builds fallback summary data", () => {
  const document = createAnalysisDocument();
  delete document.summary;

  const analysis = normalizeAnalysisResult(document);

  expect(analysis.summary).toEqual({
    dependenciesAnalysed: 3,
    smellsDetected: 3,
    severityCounts: {
      Critical: 0,
      High: 1,
      Medium: 1,
      Low: 1
    }
  });
});

/** Verifies malformed backend documents are rejected before graph rendering. */
test("normalizeAnalysisResult validates the required JSON contract", () => {
  expect(() => normalizeAnalysisResult(null)).toThrow(/valid JSON object/);
  expect(() => normalizeAnalysisResult({})).toThrow(/graph\.nodes and graph\.edges/);
  expect(() => normalizeAnalysisResult({ graph: { nodes: [], edges: [] } })).toThrow(
    /smells array/
  );
});

/** Verifies project-level findings are associated with an existing root node. */
test("normalizeAnalysisResult associates project smells with the root node", () => {
  const document = createAnalysisDocument();
  const exportedRoot = document.graph.nodes.find((node) => node.id === "root");
  exportedRoot.hasSmells = true;
  exportedRoot.highestSeverity = "Medium";
  document.summary.smellsDetected += 1;
  document.summary.severityCounts.Medium += 1;
  document.smells.push({
    id: "SMELL-ROOT",
    type: "No Source Code URL",
    affectedPackage: "sample-app",
    affectedVersion: "1.0.0",
    score: { finalScore: 42, finalRating: "Medium" }
  });

  const analysis = normalizeAnalysisResult(document);
  const root = analysis.graph.nodes.find((node) => node.id === "root");

  expect(root.hasSmells).toBe(true);
  expect(root.smells.map((smell) => smell.id)).toEqual(["SMELL-ROOT"]);
  expect(root.highestSeverity).toBe("Medium");
});

/** Verifies older outputs receive a synthetic root when they contain project-level smells. */
test("normalizeAnalysisResult restores an omitted root node", () => {
  const document = createAnalysisDocument();
  document.graph.nodes = document.graph.nodes.filter((node) => node.id !== "root");
  delete document.summary;
  document.smells.push({
    id: "SMELL-ROOT",
    type: "No Package-Lock",
    affectedPackage: "sample-app",
    affectedVersion: "1.0.0",
    score: { finalScore: 60, finalRating: "Medium" }
  });

  const analysis = normalizeAnalysisResult(document);
  const root = analysis.graph.nodes.find((node) => node.id === "root");

  expect({
    name: root.name,
    version: root.version,
    dependencyType: root.dependencyType,
    depth: root.depth,
    smellIds: root.smells.map((smell) => smell.id)
  }).toEqual({
    name: "sample-app",
    version: "1.0.0",
    dependencyType: "root",
    depth: 0,
    smellIds: ["SMELL-ROOT"]
  });
});

/** Verifies the strongest associated smell determines a node's derived severity. */
test("normalizeAnalysisResult selects the highest node severity", () => {
  const analysis = normalizeAnalysisResult(createAnalysisDocument());
  const urlNode = analysis.graph.nodes.find((node) => node.id === "url-package@2.0.0");

  expect(urlNode.highestSeverity).toBe("High");
});

/** Verifies severity filtering excludes nonmatching smelled and contextual nodes. */
test("filterGraph filters findings by final severity", () => {
  const analysis = normalizeAnalysisResult(createAnalysisDocument());
  const graph = filterGraph(analysis, createFilters(analysis.smellTypes, ["Medium"]));

  expect(graph.nodes.map((node) => node.id)).toEqual(["root", "deprecated-package@3.0.0"]);
  expect(graph.edges).toEqual([
    {
      source: "root",
      target: "deprecated-package@3.0.0",
      relationship: "direct",
      smellIds: ["SMELL-003"]
    }
  ]);
});

/** Verifies smell-type filtering uses the backend's public smell designation. */
test("filterGraph filters findings by smell type", () => {
  const analysis = normalizeAnalysisResult(createAnalysisDocument());
  const graph = filterGraph(analysis, createFilters(["URL Dependency"]));

  expect(graph.nodes.some((node) => node.id === "url-package@2.0.0")).toBe(true);
  expect(graph.nodes.some((node) => node.id === "deprecated-package@3.0.0")).toBe(false);
});

/** Verifies filtering retains only the immediate parent and edge needed for graph context. */
test("filterGraph preserves the immediate parent of a matching dependency", () => {
  const analysis = normalizeAnalysisResult(createAnalysisDocument());
  const graph = filterGraph(analysis, createFilters(["URL Dependency"]));

  expect(graph.nodes.map((node) => node.id)).toEqual([
    "parent-package@1.0.0",
    "url-package@2.0.0"
  ]);
  expect(graph.edges).toEqual([
    {
      source: "parent-package@1.0.0",
      target: "url-package@2.0.0",
      relationship: "transitive",
      smellIds: ["SMELL-001", "SMELL-002"]
    }
  ]);
});

/** Verifies visible graph statistics count contextual and smelled nodes independently. */
test("buildVisibleStats reports rendered graph totals", () => {
  const analysis = normalizeAnalysisResult(createAnalysisDocument());
  const graph = filterGraph(analysis, createFilters(["URL Dependency"]));

  expect(buildVisibleStats(graph)).toEqual({
    nodes: 2,
    edges: 1,
    smelledNodes: 1
  });
  expect(filterGraph(null, createFilters([]))).toEqual({ nodes: [], edges: [] });
});
