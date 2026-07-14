import test from "node:test";
import assert from "node:assert/strict";
import { buildRootDependencyTypesByName, ProjectInspector } from "../src/analysis/ProjectInspector.js";

/** Verifies that package.json dependency sections are normalized into the graph node dependency type contract. */
test("buildRootDependencyTypesByName maps root dependencies to production or development", () => {
  const dependencyTypes = buildRootDependencyTypesByName({
    dependencies: {
      react: "^18.2.0",
      shared: "^1.0.0"
    },
    devDependencies: {
      vite: "^5.0.0",
      shared: "^1.0.0"
    },
    optionalDependencies: {
      fsevents: "^2.3.3"
    },
    peerDependencies: {
      lodash: "^4.17.21"
    }
  });

  assert.deepEqual(dependencyTypes, {
    react: "production",
    shared: "production",
    vite: "development",
    fsevents: "production",
    lodash: "production"
  });
});

/** Verifies that remote GitHub inspections use package-lock.json when it is available. */
test("ProjectInspector builds a full npm graph for remote repositories with package-lock.json", async () => {
  const requestedRefs = [];
  const fetcher = {
    async fetchRepositoryMetadata() {
      throw new Error("default branch lookup should not run when analysedRef is explicit");
    },
    async fetch({ ref }) {
      requestedRefs.push(ref);
      return {
        name: "remote-app",
        version: "1.0.0",
        dependencies: { react: "^18.2.0" }
      };
    },
    async fetchJsonFile({ ref }) {
      requestedRefs.push(ref);
      return {
        name: "remote-app",
        version: "1.0.0",
        lockfileVersion: 3,
        packages: {
          "": {
            name: "remote-app",
            version: "1.0.0",
            dependencies: { react: "^18.2.0" }
          },
          "node_modules/react": {
            version: "18.2.0"
          }
        }
      };
    }
  };
  const inspector = new ProjectInspector({ githubPackageJsonFetcher: fetcher });

  const inspected = await inspector.inspect({
    target: "owner/remote-app",
    analysedRef: "main",
    githubToken: "token"
  });

  assert.deepEqual(requestedRefs, ["main", "main"]);
  assert.equal(inspected.project.repository, "owner/remote-app");
  assert.equal(inspected.project.analysedRef, "main");
  assert.equal(inspected.graph.nodes.filter((node) => node.id !== "root").length, 1);
  assert.ok(inspected.graph.nodes.find((node) => node.id === "react@18.2.0" && node.dependencyType === "production"));
  assert.ok(inspected.graph.edges.find((edge) => edge.source === "root" && edge.target === "react@18.2.0"));
});

/** Verifies that remote inspections resolve the GitHub default branch when no ref is provided. */
test("ProjectInspector resolves GitHub default branch for remote repositories without explicit ref", async () => {
  const requestedRefs = [];
  const fetcher = {
    async fetchRepositoryMetadata() {
      return { defaultBranch: "main" };
    },
    async fetch({ ref }) {
      requestedRefs.push(ref);
      return {
        name: "remote-app",
        version: "1.0.0",
        dependencies: { react: "^18.2.0" }
      };
    },
    async fetchJsonFile({ ref }) {
      requestedRefs.push(ref);
      return {
        name: "remote-app",
        version: "1.0.0",
        lockfileVersion: 3,
        packages: {
          "": {
            name: "remote-app",
            version: "1.0.0",
            dependencies: { react: "^18.2.0" }
          },
          "node_modules/react": {
            version: "18.2.0"
          }
        }
      };
    }
  };
  const inspector = new ProjectInspector({ githubPackageJsonFetcher: fetcher });

  const inspected = await inspector.inspect({
    target: "owner/remote-app",
    githubToken: "token"
  });

  assert.deepEqual(requestedRefs, ["main", "main"]);
  assert.equal(inspected.project.analysedRef, "main");
  assert.deepEqual(inspected.warnings, []);
});

/** Verifies that default branch lookup failures are reported without blocking analysis. */
test("ProjectInspector warns and falls back to tool defaults when default branch lookup fails", async () => {
  const requestedRefs = [];
  const fetcher = {
    async fetchRepositoryMetadata() {
      throw new Error("GitHub API unavailable");
    },
    async fetch({ ref }) {
      requestedRefs.push(ref);
      return {
        name: "remote-app",
        version: "1.0.0"
      };
    },
    async fetchJsonFile({ ref }) {
      requestedRefs.push(ref);
      return {
        name: "remote-app",
        version: "1.0.0",
        lockfileVersion: 3,
        packages: {
          "": {
            name: "remote-app",
            version: "1.0.0"
          }
        }
      };
    }
  };
  const inspector = new ProjectInspector({ githubPackageJsonFetcher: fetcher });

  const inspected = await inspector.inspect({
    target: "owner/remote-app",
    githubToken: "token"
  });

  assert.deepEqual(requestedRefs, [null, null]);
  assert.equal(inspected.project.analysedRef, null);
  assert.match(inspected.warnings[0], /Could not resolve GitHub default branch/);
});
