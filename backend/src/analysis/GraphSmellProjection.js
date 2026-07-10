/** Severity ordering used to keep only the highest smell rating on each graph node. */
const SEVERITY_RANK = Object.freeze({
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
});

/** Annotates graph nodes with smell presence and highest severity for frontend rendering. */
export function projectSmellsOntoGraph(graph, scoredSmells) {
  const nodes = graph.nodes.map((node) => ({ ...node, hasSmells: false, highestSeverity: null }));
  const nodeByName = new Map(nodes.map((node) => [node.name, node]));

  for (const smell of scoredSmells) {
    const node = nodeByName.get(smell.affectedPackage);
    if (!node) {
      continue;
    }

    node.hasSmells = true;
    if (!node.highestSeverity || SEVERITY_RANK[smell.score.finalRating] > SEVERITY_RANK[node.highestSeverity]) {
      node.highestSeverity = smell.score.finalRating;
    }
  }

  return {
    nodes,
    edges: graph.edges
  };
}
