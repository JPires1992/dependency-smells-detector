import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

/** Promise-based process runner used to verify the production CLI composition root. */
const execFileAsync = promisify(execFile);

/** Verifies that the CLI can load all configured detector modules and print its help contract. */
test("CLI loads the configured detector registry", async () => {
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    ["src/cli.js", "--help"],
    { cwd: new URL("../", import.meta.url) }
  );

  assert.match(stdout, /--target <owner\/repo>/);
  assert.equal(stderr, "");
});
