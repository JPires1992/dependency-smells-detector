import test from "node:test";
import assert from "node:assert/strict";
import { parsePositiveInteger } from "../src/utils/PositiveInteger.js";

/** Verifies positive integer settings and stable fallback behavior. */
test("parsePositiveInteger accepts only positive integer values", () => {
  assert.equal(parsePositiveInteger("3600000", 1000), 3600000);
  assert.equal(parsePositiveInteger(4, 1000), 4);
  assert.equal(parsePositiveInteger("", 1000), 1000);
  assert.equal(parsePositiveInteger(null, 1000), 1000);
  assert.equal(parsePositiveInteger("0", 1000), 1000);
  assert.equal(parsePositiveInteger("-1", 1000), 1000);
  assert.equal(parsePositiveInteger("1.5", 1000), 1000);
  assert.equal(parsePositiveInteger("abc", 1000), 1000);
});
