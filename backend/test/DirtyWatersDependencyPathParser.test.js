import test from "node:test";
import assert from "node:assert/strict";
import { DirtyWatersDependencyPathParser } from "../src/detectors/dirty-waters/DirtyWatersDependencyPathParser.js";

/** Verifies Dirty-Waters paths are normalized to immediate parent graph references. */
test("DirtyWatersDependencyPathParser extracts immediate parents", () => {
  const parentEvidence =
    "<details><summary>2 paths</summary><pre>" +
    "[frontend@0.0.0](https://npmjs.com/package/frontend/v/0.0.0)<br>" +
    "    [@vitejs/plugin-react@5.1.1](https://npmjs.com/package/@vitejs/plugin-react/v/5.1.1)<br>" +
    "        [@babel/template@7.27.2](https://npmjs.com/package/@babel/template/v/7.27.2)<br>" +
    "            [@babel/code-frame@7.27.1](https://npmjs.com/package/@babel/code-frame/v/7.27.1)<br>" +
    "        [@babel/traverse@7.28.5](https://npmjs.com/package/@babel/traverse/v/7.28.5)<br>" +
    "            [@babel/code-frame@7.27.1](https://npmjs.com/package/@babel/code-frame/v/7.27.1)" +
    "</pre></details>";

  const graphContext = new DirtyWatersDependencyPathParser().parse(
    parentEvidence,
    { name: "@babel/code-frame", version: "7.27.1" },
    { "@vitejs/plugin-react": "development" }
  );

  assert.deepEqual(graphContext, {
    nodeId: "@babel/code-frame@7.27.1",
    depth: 3,
    dependencyType: "development",
    parentNodes: [
      {
        id: "@babel/template@7.27.2",
        name: "@babel/template",
        version: "7.27.2",
        depth: 2,
        dependencyType: "development"
      },
      {
        id: "@babel/traverse@7.28.5",
        name: "@babel/traverse",
        version: "7.28.5",
        depth: 2,
        dependencyType: "development"
      }
    ]
  });
});

/** Verifies package references retain inferred depth and root dependency scope. */
test("DirtyWatersDependencyPathParser parses package references", () => {
  const parentEvidence =
    "[frontend@0.0.0](https://npmjs.com/package/frontend/v/0.0.0)<br>" +
    "    [parent@2.0.0](https://npmjs.com/package/parent/v/2.0.0)<br>" +
    "        [child@1.0.0](https://npmjs.com/package/child/v/1.0.0)";

  assert.deepEqual(
    new DirtyWatersDependencyPathParser().parsePackageRefs(
      parentEvidence,
      { parent: "development" }
    ),
    [
      { id: "root", name: "frontend", version: "0.0.0", depth: 0, dependencyType: "root" },
      { name: "parent", version: "2.0.0", depth: 1, dependencyType: "development" },
      { name: "child", version: "1.0.0", depth: 2, dependencyType: "development" }
    ]
  );
});

/** Verifies production paths take precedence over shorter development paths. */
test("DirtyWatersDependencyPathParser prefers production depth", () => {
  const parentEvidence =
    "[app@1.0.0](https://npmjs.com/package/app/v/1.0.0)<br>" +
    "    [dev-parent@1.0.0](https://npmjs.com/package/dev-parent/v/1.0.0)<br>" +
    "        [debug@4.4.3](https://npmjs.com/package/debug/v/4.4.3)<br>" +
    "[app@1.0.0](https://npmjs.com/package/app/v/1.0.0)<br>" +
    "    [prod-parent@1.0.0](https://npmjs.com/package/prod-parent/v/1.0.0)<br>" +
    "        [prod-middle@1.0.0](https://npmjs.com/package/prod-middle/v/1.0.0)<br>" +
    "            [debug@4.4.3](https://npmjs.com/package/debug/v/4.4.3)";

  const graphContext = new DirtyWatersDependencyPathParser().parse(
    parentEvidence,
    { name: "debug", version: "4.4.3" },
    { "dev-parent": "development", "prod-parent": "production" }
  );

  assert.equal(graphContext.dependencyType, "production");
  assert.equal(graphContext.depth, 3);
});
