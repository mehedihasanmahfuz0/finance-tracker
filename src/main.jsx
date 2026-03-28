/**
 * ============================================================
 * FILE: src/main.jsx
 * ============================================================
 *
 * PURPOSE:
 *   The JavaScript entry point — the very first file Vite loads.
 *   Its only job is to mount the React application into the DOM.
 *
 * WHY SO MINIMAL?
 *   Following the single-responsibility principle:
 *   • main.jsx   → mounts React (one job)
 *   • App.jsx    → wires providers and the page (one job)
 *   • HomePage   → renders the UI shell (one job)
 *   Keeping entry-point files tiny makes it obvious where
 *   bootstrapping ends and application logic begins.
 *
 * StrictMode:
 *   React.StrictMode wraps the app in development builds only.
 *   It intentionally double-invokes render functions and effects
 *   to surface side-effects that should be idempotent.
 *   It has ZERO effect in production builds.
 * ============================================================
 */

import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App";

ReactDOM.createRoot(
  document.getElementById("root")   // The <div id="root"> in index.html
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
