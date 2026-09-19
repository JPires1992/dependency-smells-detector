import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Configures the React build, local servers, and jsdom-based Vitest environment. */
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1"
  },
  preview: {
    host: "127.0.0.1"
  },
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx"]
    }
  }
});
