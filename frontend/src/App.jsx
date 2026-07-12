import React, { useMemo, useRef, useState } from "react";
import { buildVisibleStats, filterGraph, normalizeAnalysisResult, SEVERITIES } from "./analysisResult.js";
import { CytoscapeGraph } from "./CytoscapeGraph.jsx";

/** Coordinates JSON loading, staged filters, Cytoscape rendering, and dependency detail panels. */
export function App() {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(createEmptyFilters());
  const [draftFilters, setDraftFilters] = useState(createEmptyFilters());
  const visibleGraph = useMemo(() => filterGraph(analysis, appliedFilters), [analysis, appliedFilters]);
  const visibleStats = useMemo(() => buildVisibleStats(visibleGraph), [visibleGraph]);

  /** Loads a parsed backend document and resets graph selection plus filters. */
  function handleDocumentLoaded(document) {
    const normalized = normalizeAnalysisResult(document);
    const nextFilters = createFiltersForAnalysis(normalized);
    setAnalysis(normalized);
    setSelectedNode(null);
    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);
    setError("");
  }

  /** Applies staged filter changes to the rendered Cytoscape graph. */
  function applyFilters() {
    setSelectedNode(null);
    setAppliedFilters(cloneFilters(draftFilters));
  }

  return (
    <main className="app-shell">
      <header className="top-area">
        <div className="title-row">
          <div>
            <p className="eyebrow">Dependency Smells Detector</p>
            <h1>Analysis Graph</h1>
          </div>
          <FileLoader onLoaded={handleDocumentLoaded} onError={setError} />
        </div>

        {error && <p className="error-message">{error}</p>}

        {analysis && (
          <div className="top-controls">
            <ProjectSummary analysis={analysis} />
            <Legend />
          </div>
        )}
      </header>

      <section className="content-grid">
        {analysis ? (
          <>
            <section className="graph-header">
              <GraphToolbar analysis={analysis} visibleStats={visibleStats} />
              <FilterPanel
                analysis={analysis}
                filters={draftFilters}
                onFiltersChanged={setDraftFilters}
                onApply={applyFilters}
              />
            </section>
            <div className="graph-canvas-slot">
              <CytoscapeGraph graph={visibleGraph} onNodeSelected={setSelectedNode} />
            </div>
            <NodeDetails node={selectedNode} />
          </>
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

/** Creates a filter object with all severities selected and no smell types yet available. */
function createEmptyFilters() {
  return {
    severities: new Set(SEVERITIES),
    smellTypes: new Set()
  };
}

/** Creates a filter object with every option selected for one loaded analysis result. */
function createFiltersForAnalysis(analysis) {
  return {
    severities: new Set(SEVERITIES),
    smellTypes: new Set(analysis?.smellTypes ?? [])
  };
}

/** Clones filter Sets so React state updates cannot share mutable references. */
function cloneFilters(filters) {
  return {
    severities: new Set(filters.severities),
    smellTypes: new Set(filters.smellTypes)
  };
}

/** Reads a backend analysis JSON file from the user's filesystem through a custom upload control. */
function FileLoader({ onLoaded, onError }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("No file selected");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      onLoaded(JSON.parse(text));
      setFileName(file.name);
    } catch (error) {
      onError(`Could not load analysis JSON: ${error.message}`);
    }
  }

  return (
    <div className="file-loader">
      <span>Backend JSON output</span>
      <div className="file-picker-row">
        <button className="primary-button" type="button" onClick={() => inputRef.current?.click()}>
          Choose JSON File
        </button>
        <p title={fileName}>{fileName}</p>
      </div>
      <input ref={inputRef} type="file" accept="application/json,.json" onChange={handleFileChange} />
    </div>
  );
}

/** Displays the backend JSON summary metrics and severity count breakdown. */
function ProjectSummary({ analysis }) {
  const severityCounts = analysis.summary.severityCounts ?? {};
  const smellTypeCounts = countSmellsByType(analysis.smells);
  const generatedAt = formatDateTime(analysis.metadata.generatedAt);

  return (
    <section className="control-panel summary-panel">
      <h2>Summary</h2>
      <div className="summary-context">
        <div>
          <span>Application</span>
          <strong>{analysis.project.name || "Unknown application"}</strong>
        </div>
        <div>
          <span>Repository</span>
          <strong>{analysis.project.repository || "Local JSON artefact"}</strong>
        </div>
        <div>
          <span>Analysis Date</span>
          <strong>{generatedAt}</strong>
        </div>
      </div>
      <dl className="metric-grid">
        <Metric label="Dependencies Analysed" value={analysis.summary.dependenciesAnalysed ?? 0} />
        <Metric label="Smells Detected" value={analysis.summary.smellsDetected ?? analysis.smells.length} />
        <Metric label="Critical" value={severityCounts.Critical ?? 0} />
        <Metric label="High" value={severityCounts.High ?? 0} />
        <Metric label="Medium" value={severityCounts.Medium ?? 0} />
        <Metric label="Low" value={severityCounts.Low ?? 0} />
      </dl>
      <div className="smell-type-summary">
        <h3>Smell Types</h3>
        <div>
          {[...smellTypeCounts.entries()].map(([type, count]) => (
            <span key={type}>
              {type} <strong>{count}</strong>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Counts detected smells by smell type for summary-level distribution display. */
function countSmellsByType(smells) {
  const counts = new Map();
  for (const smell of smells) {
    counts.set(smell.type, (counts.get(smell.type) ?? 0) + 1);
  }

  return new Map([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

/** Formats backend ISO timestamps for compact display in the summary panel. */
function formatDateTime(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

/** Renders one compact numeric metric in the summary panel. */
function Metric({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Provides staged severity and smell-type filters for reducing the graph view on apply. */
function FilterPanel({ analysis, filters, onFiltersChanged, onApply }) {
  return (
    <section className="control-panel filter-panel">
      <div className="panel-heading">
        <h2>Filters</h2>
        <div className="filter-actions">
          <button className="primary-button" type="button" onClick={onApply}>
            Apply Filters
          </button>
        </div>
      </div>

      <div className="filter-groups">
        <div className="filter-row">
          <h3>Severity</h3>
          <CheckboxList
            values={SEVERITIES}
            selected={filters.severities}
            onToggle={(value) => onFiltersChanged({ ...filters, severities: toggleSetValue(filters.severities, value) })}
          />
        </div>

        <div className="filter-row">
          <h3>Smell Type</h3>
          <CheckboxList
            values={analysis.smellTypes}
            selected={filters.smellTypes}
            onToggle={(value) => onFiltersChanged({ ...filters, smellTypes: toggleSetValue(filters.smellTypes, value) })}
          />
        </div>
      </div>
    </section>
  );
}

/** Renders a reusable checkbox list for graph filters. */
function CheckboxList({ values, selected, onToggle }) {
  return (
    <div className="checkbox-list">
      {values.map((value) => (
        <label key={value}>
          <input type="checkbox" checked={selected.has(value)} onChange={() => onToggle(value)} />
          <span>{value}</span>
        </label>
      ))}
    </div>
  );
}

/** Returns a cloned Set with one value toggled on or off. */
function toggleSetValue(set, value) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
}

/** Shows the graph color contract used by Cytoscape nodes. */
function Legend() {
  const items = [
    ["Critical", "legend-critical"],
    ["High", "legend-high"],
    ["Medium", "legend-medium"],
    ["Low", "legend-low"],
    ["No smells", "legend-none"]
  ];

  return (
    <section className="control-panel legend-panel">
      <h2>Legend</h2>
      <div className="legend-list">
        {items.map(([label, className]) => (
          <span key={label}>
            <i className={className} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Displays the loaded project name and current rendered graph counts above Cytoscape. */
function GraphToolbar({ analysis, visibleStats }) {
  return (
    <div className="graph-toolbar">
      <div>
        <h2>{analysis.project.name || "Loaded analysis"}</h2>
        <p>{analysis.project.repository || "Local JSON artefact"}</p>
      </div>
      <div className="toolbar-counts">
        <span>{visibleStats.nodes} nodes</span>
        <span>{visibleStats.edges} edges</span>
      </div>
    </div>
  );
}

/** Displays metadata and smell details for the selected graph node. */
function NodeDetails({ node }) {
  if (!node) {
    return (
      <aside className="node-details empty">
        <h2>Dependency Details</h2>
        <p>Select a node to inspect package metadata, dependency scope, score, and smell evidence.</p>
      </aside>
    );
  }

  return (
    <aside className="node-details">
      <h2>{node.name}</h2>
      <dl className="detail-grid">
        <Detail label="Version" value={node.version ?? "n/a"} />
        <Detail label="Dependency Type" value={node.dependencyType ?? "unknown"} />
        <Detail label="Depth" value={node.depth ?? "unknown"} />
        <Detail label="Highest Severity" value={node.highestSeverity ?? "None"} />
      </dl>
      <div className="smell-list">
        {node.smells.length > 0 ? (
          node.smells.map((smell) => <SmellCard key={smell.id} smell={smell} />)
        ) : (
          <p>This node is included as graph context and has no detected smells.</p>
        )}
      </div>
    </aside>
  );
}

/** Renders one key-value row in the selected node detail section. */
function Detail({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Shows one smell finding with score and evidence summary. */
function SmellCard({ smell }) {
  return (
    <article className="smell-card">
      <header>
        <span>{smell.type}</span>
        <strong>{smell.score?.finalRating ?? "Unknown"}</strong>
      </header>
      <p>{smell.evidence}</p>
      <dl>
        <Detail label="Score" value={smell.score?.finalScore ?? "n/a"} />
        <Detail label="Source" value={smell.detectionSource ?? "n/a"} />
      </dl>
    </article>
  );
}

/** Presents the initial file-selection state before a JSON artefact is loaded. */
function EmptyState() {
  return (
    <div className="empty-state">
      <h2>Select an analysis JSON file</h2>
      <p>The dependency graph, severity coloring, and smell filters appear after loading the backend output.</p>
    </div>
  );
}
