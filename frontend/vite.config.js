import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Configures Vite to use the React JSX runtime and local development server defaults. */
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1"
  },
  preview: {
    host: "127.0.0.1"
  }
});
