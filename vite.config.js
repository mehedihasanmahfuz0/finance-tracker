/**
 * FILE: vite.config.js
 * ────────────────────
 * Vite build configuration.
 *
 * @vitejs/plugin-react enables:
 *   • Fast Refresh (hot module replacement for React components)
 *   • JSX transform (no need to import React in every file for JSX)
 *   • Babel-powered JSX compilation
 */
import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server : {
    port: 5173,   // Default Vite dev-server port
    open: true,   // Automatically open browser on `npm run dev`
  },
});
