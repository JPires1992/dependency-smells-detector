import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/** Removes rendered React trees after each test to isolate DOM state and effects. */
afterEach(() => {
  cleanup();
});
