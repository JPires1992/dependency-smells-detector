import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CytoscapeGraph } from "../src/CytoscapeGraph.jsx";

const { cytoscapeFactory } = vi.hoisted(() => ({
  cytoscapeFactory: vi.fn()
}));

vi.mock("cytoscape", () => ({
  default: cytoscapeFactory
}));

let cytoscapeInstance;

/** Builds graph nodes covering every severity class and one contextual dependency. */
function createGraph() {
  return {
    nodes: [
      { id: "critical@1", name: "critical", hasSmells: true, highestSeverity: "Critical" },
      { id: "high@1", name: "high", hasSmells: true, highestSeverity: "High" },
      { id: "medium@1", name: "medium", hasSmells: true, highestSeverity: "Medium" },
      { id: "low@1", name: "low", hasSmells: true, highestSeverity: "Low" },
      { id: "context@1", name: "context", hasSmells: false, highestSeverity: null }
    ],
    edges: [
      { source: "context@1", target: "critical@1", relationship: "transitive" }
    ]
  };
}

/** Creates a fresh Cytoscape test double for every component test. */
beforeEach(() => {
  cytoscapeInstance = {
    on: vi.fn(),
    destroy: vi.fn()
  };
  cytoscapeFactory.mockReset();
  cytoscapeFactory.mockReturnValue(cytoscapeInstance);
});

/** Verifies graph data is converted to Cytoscape elements and semantic severity classes. */
test("CytoscapeGraph initializes Cytoscape with graph elements", () => {
  render(<CytoscapeGraph graph={createGraph()} onNodeSelected={vi.fn()} />);

  expect(cytoscapeFactory).toHaveBeenCalledOnce();
  const options = cytoscapeFactory.mock.calls[0][0];
  const nodeClasses = Object.fromEntries(
    options.elements
      .filter((element) => element.data.rawNode)
      .map((element) => [element.data.id, element.classes])
  );
  const edge = options.elements.find((element) => element.data.source);

  expect(nodeClasses).toEqual({
    "critical@1": "severity-critical",
    "high@1": "severity-high",
    "medium@1": "severity-medium",
    "low@1": "severity-low",
    "context@1": "severity-none"
  });
  expect(edge.data).toEqual({
    id: "context@1->critical@1-0",
    source: "context@1",
    target: "critical@1",
    relationship: "transitive"
  });
  expect(options.layout.name).toBe("cose");
});

/** Verifies Cytoscape selection events are forwarded and its instance is destroyed on unmount. */
test("CytoscapeGraph forwards selections and cleans up the Cytoscape instance", () => {
  const graph = createGraph();
  const onNodeSelected = vi.fn();
  const { unmount } = render(
    <CytoscapeGraph graph={graph} onNodeSelected={onNodeSelected} />
  );
  const nodeTapHandler = cytoscapeInstance.on.mock.calls.find(
    ([eventName, selector]) => eventName === "tap" && selector === "node"
  )[2];
  const backgroundTapHandler = cytoscapeInstance.on.mock.calls.find(
    ([eventName, handler]) => eventName === "tap" && typeof handler === "function"
  )[1];

  nodeTapHandler({
    target: {
      data: (key) => key === "rawNode" ? graph.nodes[0] : undefined
    }
  });
  backgroundTapHandler({ target: cytoscapeInstance });

  expect(onNodeSelected).toHaveBeenNthCalledWith(1, graph.nodes[0]);
  expect(onNodeSelected).toHaveBeenNthCalledWith(2, null);

  unmount();
  expect(cytoscapeInstance.destroy).toHaveBeenCalledOnce();
});
