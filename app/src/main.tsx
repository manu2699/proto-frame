// Production entry: read the inlined #wf-model, wire the browser adapters
// (localStorage + live MCP transport), and mount the App. This is the only file
// that binds the app to the harness HTML — everything else is injectable.

import { createRoot } from "react-dom/client";
import { App } from "./App";
import { readModel } from "./model/read";
import { localStorageAdapter } from "./ports/storage";
import { createLiveTransport } from "./ports/transport";

declare global {
  interface Window { __wfRoot?: ReturnType<typeof createRoot>; }
}

const container = document.getElementById("wf-root")!;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

try {
  const { model, meta } = readModel();
  const storage = localStorageAdapter("wfc:" + location.pathname);
  const transport = createLiveTransport();

  const app = <App model={model} meta={meta} storage={storage} transport={transport} />;
  if (window.__wfRoot) {
    window.__wfRoot.render(app);
  } else {
    window.__wfRoot = createRoot(container);
    window.__wfRoot.render(app);
  }
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  container.innerHTML =
    `<div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px;font-family:-apple-system,sans-serif;color:#71717a;padding:40px">` +
    `<div style="font-size:14px;font-weight:600;color:#ef4444">Wireframe failed to load</div>` +
    `<pre style="font-size:12px;background:#fef2f2;border:1px solid #fecaca;padding:12px 16px;border-radius:6px;max-width:600px;white-space:pre-wrap;color:#991b1b">${escapeHtml(msg)}</pre>` +
    `<div style="font-size:11px">Check that the agent passed a valid model with a "screens" array.</div>` +
    `</div>`;
}
