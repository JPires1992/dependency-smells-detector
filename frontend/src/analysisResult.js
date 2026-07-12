/** Severity order used for filtering, summaries, and Cytoscape node classes. */
export const SEVERITIES = Object.freeze(["Critical", "High", "Medium", "Low"]);

/** Maps node severity values to semantic CSS/Cytoscape class names. */
export const SEVERITY_CLASS_BY_NAME = Object.freeze({
  Critical: "severity-critical",
  High: "severity-high",
  Medium: "severity-medium",
  Low: "severity-low"
});

/** Builds a validated frontend view model from the backend JSON contract. */
export function normalizeAnalysisResult(document) {
  if (!document || typeof document !== "object") {
    throw new Error("The selected file does not contain a valid JSON object.");
  }

  if (!document.graph || !Array.isArray(document.graph.nodes) || !Array.isArray(document.graph.edges)) {
    throw new Error("The JSON file does not contain graph.nodes and graph.edges arrays.");
  }

  if (!Array.isArray(document.smells)) {
    throw new Error("The JSON file does not contain a smells array.");
  }

  const smellsByPackageId = groupSmellsByPackageId(document.smells);
  const nodes = document.graph.nodes.map((node) => ({
    ...node,
    smells: smellsByPackageId.get(node.id) ?? []
  }));

  return {
    metadata: document.metadata ?? {},
    project: document.project ?? {},
    summary: document.summary ?? buildFallbackSummary(nodes, document.smells),
    graph: {
      nodes,
      edges: document.graph.edges
    },
    smellTypes: getUniqueSortedValues(document.smells.map((smell) => smell.type)),
    smells: document.smells
  };
}

/** Converts backend smells into a lookup keyed by the dependency graph node id. */
function groupSmellsByPackageId(smells) {
  const grouped = new Map();

  for (const smell of smells) {
    const id = toPackageId(smell.affectedPackage, smell.affectedVersion);
    const entries = grouped.get(id) ?? [];
    entries.push(smell);
    grouped.set(id, entries);
  }

  return grouped;
}

/** Creates the canonical package id used by the backend graph contract. */
function toPackageId(name, version) {
  return version ? `${name}@${version}` : name;
}

/** Computes fallback summary data for older JSON artefacts without a summary block. */
function buildFallbackSummary(nodes, smells) {
  const severityCounts = Object.fromEntries(SEVERITIES.map((severity) => [severity, 0]));
  for (const smell of smells) {
    if (severityCounts[smell.score?.finalRating] !== undefined) {
      severityCounts[smell.score.finalRating] += 1;
    }
  }

  return {
    dependenciesAnalysed: nodes.filter((node) => node.id !== "root").length,
    smellsDetected: smells.length,
    severityCounts
  };
}

/** Returns unique string values in a stable case-insensitive order. */
function getUniqueSortedValues(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

/** Applies severity and smell-type filters while preserving parent nodes needed to read graph context. */
export function filterGraph(analysis, filters) {
  if (!analysis) {
    return { nodes: [], edges: [] };
  }

  const selectedSeverities = filters.severities;
  const selectedTypes = filters.smellTypes;
  const hasSeverityFilter = selectedSeverities.size < SEVERITIES.length;
  const hasTypeFilter = analysis.smellTypes.length > 0 && selectedTypes.size < analysis.smellTypes.length;
  const hasActiveFilter = hasSeverityFilter || hasTypeFilter;

  if (!hasActiveFilter) {
    return analysis.graph;
  }

  const matchingSmelledNodeIds = new Set(
    analysis.graph.nodes
      .filter((node) => node.smells.some((smell) => smellMatchesFilters(smell, filters)))
      .map((node) => node.id)
  );
  const visibleNodeIds = new Set(matchingSmelledNodeIds);

  for (const edge of analysis.graph.edges) {
    if (matchingSmelledNodeIds.has(edge.target)) {
      visibleNodeIds.add(edge.source);
    }
  }

  return {
    nodes: analysis.graph.nodes.filter((node) => visibleNodeIds.has(node.id)),
    edges: analysis.graph.edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
  };
}

/** Checks whether one smell is included by the current UI filter state. */
function smellMatchesFilters(smell, filters) {
  const severity = smell.score?.finalRating;
  const severityMatches = filters.severities.has(severity);
  const typeMatches = filters.smellTypes.has(smell.type);
  return severityMatches && typeMatches;
}

/** Counts visible graph nodes and edges for the current filtered view. */
export function buildVisibleStats(graph) {
  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    smelledNodes: graph.nodes.filter((node) => node.hasSmells).length
  };
}
