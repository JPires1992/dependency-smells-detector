import React, { useEffect, useMemo, useRef } from "react";
import cytoscape from "cytoscape";
import { SEVERITY_CLASS_BY_NAME } from "./analysisResult.js";

/** Renders dependency graph data with Cytoscape and reports selected nodes to the parent component. */
export function CytoscapeGraph({ graph, onNodeSelected }) {
  const containerRef = useRef(null);
  const cytoscapeRef = useRef(null);
  const elements = useMemo(() => toCytoscapeElements(graph), [graph]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      layout: { name: "cose", animate: false, fit: true, padding: 48 },
      minZoom: 0.12,
      maxZoom: 2.5,
      wheelSensitivity: 0.25,
      style: cytoscapeStyles
    });

    cytoscapeRef.current = cy;
    cy.on("tap", "node", (event) => {
      onNodeSelected?.(event.target.data("rawNode"));
    });
    cy.on("tap", (event) => {
      if (event.target === cy) {
        onNodeSelected?.(null);
      }
    });

    return () => {
      cy.destroy();
      cytoscapeRef.current = null;
    };
  }, [elements, onNodeSelected]);

  return <div className="graph-canvas" ref={containerRef} aria-label="Dependency graph visualisation" />;
}

/** Converts backend graph nodes and edges into Cytoscape elements with semantic classes. */
function toCytoscapeElements(graph) {
  const nodes = graph.nodes.map((node) => ({
    data: {
      id: node.id,
      label: node.name || node.id,
      severity: node.highestSeverity,
      rawNode: node
    },
    classes: nodeClassName(node)
  }));
  const edges = graph.edges.map((edge, index) => ({
    data: {
      id: `${edge.source}->${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      relationship: edge.relationship
    }
  }));

  return [...nodes, ...edges];
}

/** Chooses the Cytoscape class that controls node color and border styling. */
function nodeClassName(node) {
  if (!node.hasSmells) {
    return "severity-none";
  }

  return SEVERITY_CLASS_BY_NAME[node.highestSeverity] ?? "severity-low";
}

/** Cytoscape stylesheet aligned with the severity colors required by the prototype. */
const cytoscapeStyles = [
  {
    selector: "node",
    style: {
      "background-color": "#1f7a45",
      "border-color": "#14532d",
      "border-width": 2,
      color: "#172033",
      "font-family": "Inter, Arial, sans-serif",
      "font-size": 11,
      height: 38,
      label: "data(label)",
      "overlay-padding": 6,
      shape: "ellipse",
      "text-background-color": "#ffffff",
      "text-background-opacity": 0.82,
      "text-background-padding": 3,
      "text-halign": "center",
      "text-margin-y": 7,
      "text-max-width": 120,
      "text-valign": "bottom",
      "text-wrap": "ellipsis",
      width: 38
    }
  },
  {
    selector: ".severity-critical",
    style: { "background-color": "#dc2626", "border-color": "#7f1d1d", width: 48, height: 48 }
  },
  {
    selector: ".severity-high",
    style: { "background-color": "#f97316", "border-color": "#9a3412", width: 44, height: 44 }
  },
  {
    selector: ".severity-medium",
    style: { "background-color": "#facc15", "border-color": "#a16207", width: 40, height: 40 }
  },
  {
    selector: ".severity-low",
    style: { "background-color": "#2563eb", "border-color": "#1e3a8a", width: 36, height: 36 }
  },
  {
    selector: ".severity-none",
    style: { "background-color": "#16a34a", "border-color": "#166534", width: 34, height: 34 }
  },
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "line-color": "#9aa4b2",
      "target-arrow-color": "#9aa4b2",
      "target-arrow-shape": "triangle",
      width: 1.4
    }
  },
  {
    selector: ":selected",
    style: {
      "border-color": "#111827",
      "border-width": 4,
      "line-color": "#111827",
      "target-arrow-color": "#111827"
    }
  }
];
