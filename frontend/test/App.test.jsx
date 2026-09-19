import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { App } from "../src/App.jsx";
import { createAnalysisDocument } from "./analysisFixture.js";

vi.mock("../src/CytoscapeGraph.jsx", () => ({
  /** Exposes graph content and node-selection controls without initializing Cytoscape in App tests. */
  CytoscapeGraph({ graph, onNodeSelected }) {
    return (
      <div
        aria-label="Mock dependency graph"
        data-node-ids={graph.nodes.map((node) => node.id).join(",")}
      >
        {graph.nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onNodeSelected(node)}
          >
            Select {node.name}
          </button>
        ))}
      </div>
    );
  }
}));

/** Uploads one JSON string through the same file input used by the application. */
async function uploadJson(contents, fileName = "analysis-results.json") {
  const user = userEvent.setup();
  const input = document.querySelector('input[type="file"]');
  const file = new File([contents], fileName, { type: "application/json" });
  Object.defineProperty(file, "text", {
    configurable: true,
    value: vi.fn().mockResolvedValue(contents)
  });

  await user.upload(input, file);
  return user;
}

/** Asserts one summary definition-list metric by its visible label. */
function expectMetric(panel, label, value) {
  const term = within(panel).getByText(label);
  expect(term.nextElementSibling).toHaveTextContent(String(value));
}

/** Verifies the application starts in a clear file-selection state. */
test("App renders its initial empty state", () => {
  render(<App />);

  expect(screen.getByRole("button", { name: "Choose JSON File" })).toBeInTheDocument();
  expect(screen.getByText("No file selected")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Select an analysis JSON file" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Summary" })).not.toBeInTheDocument();
});

/** Verifies a valid backend document populates summary metrics and dynamic filters. */
test("App loads a valid JSON analysis result", async () => {
  render(<App />);
  await uploadJson(JSON.stringify(createAnalysisDocument()));

  const summaryHeading = await screen.findByRole("heading", { name: "Summary" });
  const summaryPanel = summaryHeading.closest("section");

  expect(within(summaryPanel).getByText("sample-app")).toBeInTheDocument();
  expect(within(summaryPanel).getByText("owner/sample-app")).toBeInTheDocument();
  expect(within(summaryPanel).getByText("main")).toBeInTheDocument();
  expectMetric(summaryPanel, "Dependencies Analysed", 4);
  expectMetric(summaryPanel, "Smells Detected", 3);
  expectMetric(summaryPanel, "High", 1);
  expect(within(summaryPanel).getByText("URL Dependency").parentElement).toHaveTextContent(
    "URL Dependency 1"
  );
  expect(screen.getByRole("checkbox", { name: "URL Dependency" })).toBeChecked();
  expect(screen.getByText("analysis-results.json")).toBeInTheDocument();
});

/** Verifies malformed JSON is reported without rendering analysis controls. */
test("App reports an invalid JSON upload", async () => {
  render(<App />);
  await uploadJson("{ invalid JSON");

  expect(await screen.findByText(/Could not load analysis JSON:/)).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Summary" })).not.toBeInTheDocument();
  expect(screen.getByText("No file selected")).toBeInTheDocument();
});

/** Verifies filter edits remain staged until the explicit apply command is used. */
test("App applies staged smell filters only after Apply Filters", async () => {
  render(<App />);
  const user = await uploadJson(JSON.stringify(createAnalysisDocument()));
  const graph = await screen.findByLabelText("Mock dependency graph");

  expect(graph).toHaveAttribute("data-node-ids", expect.stringContaining("url-package@2.0.0"));

  await user.click(screen.getByRole("checkbox", { name: "URL Dependency" }));
  await user.click(screen.getByRole("checkbox", { name: "No Provenance" }));
  expect(graph).toHaveAttribute("data-node-ids", expect.stringContaining("url-package@2.0.0"));

  await user.click(screen.getByRole("button", { name: "Apply Filters" }));
  await waitFor(() => {
    expect(graph).not.toHaveAttribute("data-node-ids", expect.stringContaining("url-package@2.0.0"));
  });
  expect(screen.getByText("2 nodes")).toBeInTheDocument();
  expect(screen.getByText("1 edges")).toBeInTheDocument();
});

/** Verifies node selection renders smell evidence and handles context-only parents. */
test("App renders selected dependency and context-node details", async () => {
  render(<App />);
  await uploadJson(JSON.stringify(createAnalysisDocument()));

  fireEvent.click(await screen.findByRole("button", { name: "Select url-package" }));
  const dependencyPanel = screen.getByRole("heading", { name: "url-package" }).closest("aside");

  expect(within(dependencyPanel).getByText("2.0.0")).toBeInTheDocument();
  expect(within(dependencyPanel).getByText("production")).toBeInTheDocument();
  expect(within(dependencyPanel).getByText("URL Dependency")).toBeInTheDocument();
  expect(within(dependencyPanel).getByText("CustomSmellDetector")).toBeInTheDocument();
  expect(within(dependencyPanel).getByText("Dependency is fetched directly from a URL.")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Select parent-package" }));
  const parentPanel = screen.getByRole("heading", { name: "parent-package" }).closest("aside");
  expect(
    within(parentPanel).getByText("This node is included as graph context and has no detected smells.")
  ).toBeInTheDocument();
});
