/**
 * PreviewServer — HTTP + SSE server for browser preview.
 *
 * Serves wireframes dynamically from in-memory models (no disk I/O).
 * Frozen assets (CSS, JS) are cached from the package's assets/ directory.
 */

import fs from "fs";
import path from "path";
import http from "http";
import crypto from "crypto";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import * as store from "./store.js";
import { info, debug, warn, onLog, getAll } from "./log.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "..", "assets");

const TEMPLATE_HTML = fs.readFileSync(path.join(ASSETS_DIR, "template.html"), "utf8");
const CACHED_CSS = fs.readFileSync(path.join(ASSETS_DIR, "wireframe.css"));
const CACHED_JS = fs.readFileSync(path.join(ASSETS_DIR, "dist", "wireframe-app.js"));

// Per-process secret required on every /feedback POST. Without it, any other
// origin open in the same browser (or another localhost process) could POST a
// forged "WIREFRAME APPROVED"/"WIREFRAME FEEDBACK" block that the agent would
// treat as real user input — CORS "simple requests" (e.g. Content-Type:
// text/plain) aren't preflighted, so the browser lets that POST through even
// though it can't read the response. Only a page that can read this served
// HTML (same-origin) ever learns the token.
const SESSION_TOKEN = crypto.randomBytes(16).toString("hex");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

let httpServer = null;
let baseUrl = null;

export function getBaseUrl() {
  return baseUrl;
}

function sseBootstrap(slug) {
  return `
<script>
(function () {
  var slug = ${JSON.stringify(slug)};
  var token = ${JSON.stringify(SESSION_TOKEN)};
  var es, ready = false;
  var BKEY = 'wf-bl-' + slug;
  function getLs() { try { return JSON.parse(localStorage.getItem(BKEY)||'[]'); } catch(e){ return []; } }
  function setLs(b) { try { localStorage.setItem(BKEY, JSON.stringify(b)); } catch(e){} }

  var logs = window.__wfLogs = [];
  var MAX_LOGS = 1000;
  function logPush(src, level, mod, msg, extra) {
    var e = { t: new Date().toISOString().slice(11,23), src: src, level: level, mod: mod, msg: msg };
    if (extra !== undefined) e.extra = extra;
    logs.push(e);
    if (logs.length > MAX_LOGS) logs.shift();

    // Log to standard browser console for visibility/debugging
    var consoleMsg = "[wf-" + src + "] [" + level + "] [" + mod + "] " + msg;
    if (extra) consoleMsg += " " + JSON.stringify(extra);
    if (level === "ERR") console.error(consoleMsg);
    else if (level === "WARN") console.warn(consoleMsg);
    else console.log(consoleMsg);
  }
  function bLog(level, msg, extra) { logPush("browser", level, "sse", msg, extra); }

  window.__wfDumpLogs = function () {
    var txt = logs.map(function (e) {
      var line = e.t + " " + (e.src === "server" ? "S" : "B") + " " + e.level + " [" + e.mod + "] " + e.msg;
      if (e.extra) line += " " + JSON.stringify(e.extra);
      return line;
    }).join("\\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt)
        .then(function(){ console.log("[wf] " + logs.length + " log entries copied to clipboard"); })
        .catch(function(e){ console.warn("[wf] clipboard write failed:", e && e.message); });
    }
    return txt;
  };

  window.__wfCopyModel = function () {
    var el = document.getElementById("wf-model");
    if (el && navigator.clipboard && navigator.clipboard.writeText) {
      var txt = el.textContent || "";
      console.log("Model: \\n", txt);
      console.log("\\n")
      navigator.clipboard.writeText(txt)
        .then(function(){ console.log("[wf] model copied to clipboard"); })
        .catch(function(e){ console.warn("[wf] clipboard write failed:", e && e.message); });
      return "Model copied to clipboard!";
    }
    return "Could not copy model (no element or no clipboard API)";
  };

  window.__wfConnected = false;
  function setConnected(v) {
    window.__wfConnected = v;
    bLog("INFO", v ? "connected" : "disconnected");
    if (window.__wfOnConnect && v) window.__wfOnConnect();
    if (window.__wfOnDisconnect && !v) window.__wfOnDisconnect();
  }

  function sendBlock(block, cb) {
    fetch("/" + encodeURIComponent(slug) + "/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ block: block, token: token })
    })
    .then(function (res) {
      if (res.ok) {
        if (cb) cb(null);
      } else {
        if (cb) cb(new Error("status: " + res.status));
      }
    })
    .catch(function (err) {
      if (cb) cb(err);
    });
  }

  function drainBacklog() {
    var bl = getLs();
    if (!bl.length) return;
    var block = bl.shift();
    setLs(bl);
    bLog("INFO", "draining backlog block", { len: block.length });
    sendBlock(block, function (err) {
      if (err) {
        bLog("ERR", "failed to drain block, returning to backlog", { error: err.message });
        setLs([block].concat(getLs()));
      } else {
        bLog("INFO", "backlog block drained successfully");
        drainBacklog();
      }
    });
  }

  function connect() {
    bLog("INFO", "connecting", { host: location.host, slug: slug });
    try {
      es = new EventSource("/" + encodeURIComponent(slug) + "/events");
    } catch (e) { bLog("ERR", "EventSource constructor failed", { error: e.message }); return; }
    
    es.onopen = function () {
      ready = true;
      setConnected(true);
      drainBacklog();
    };
    es.onerror = function (ev) {
      ready = false;
      setConnected(false);
      bLog("WARN", "EventSource closed or failed, auto-retrying");
    };
    es.onmessage = function (e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === "reload") { bLog("INFO", "reload signal"); window.location.reload(); }
        else if (msg.type === "log") { logPush("server", msg.entry.level, msg.entry.mod, msg.entry.msg, msg.entry.extra); }
        else if (msg.type === "log-history") {
          for (var i = 0; i < msg.entries.length; i++) {
            var h = msg.entries[i];
            logPush("server", h.level, h.mod, h.msg, h.extra);
          }
          bLog("INFO", "server log history loaded", { count: msg.entries.length });
        }
      } catch (ex) { bLog("ERR", "onmessage error", { error: ex && ex.message }); }
    };
  }

  connect();

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && (!es || es.readyState === 2)) {
      bLog("INFO", "tab visible, reconnecting SSE");
      try { if (es) es.close(); } catch(e){}
      connect();
    }
  });

  // Replay all logs on load so they appear in DevTools even if opened after page load.
  window.addEventListener("load", function () {
    console.groupCollapsed("[wf] boot log replay (" + logs.length + " entries) — type __wfDumpLogs() to copy all");
    for (var i = 0; i < logs.length; i++) {
      var le = logs[i];
      var m = le.t + " " + (le.src === "server" ? "S" : "B") + " [" + le.level + "] [" + le.mod + "] " + le.msg;
      if (le.extra) m += " " + JSON.stringify(le.extra);
      if (le.level === "ERR") console.error(m);
      else if (le.level === "WARN") console.warn(m);
      else console.log(m);
    }
    console.groupEnd();
  });

  window.__wfSend = function (block) {
    if (ready) {
      sendBlock(block, function (err) {
        if (err) {
          bLog("WARN", "failed to send block, queueing to localStorage", { error: err.message });
          setLs([].concat(getLs(), [block]));
        } else {
          bLog("INFO", "block sent", { len: block.length });
        }
      });
    } else {
      setLs([].concat(getLs(), [block]));
      bLog("WARN", "block queued to localStorage (disconnected)", { len: block.length });
    }
    var t = document.getElementById("__wf-sent");
    if (!t) {
      t = document.createElement("div");
      t.id = "__wf-sent";
      t.style.cssText = "position:fixed;bottom:80px;right:20px;z-index:2000;" +
        "background:#16a34a;color:#fff;font:500 12px/1 -apple-system,sans-serif;" +
        "padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(22,163,74,.3);" +
        "opacity:0;transition:opacity .15s ease;";
      document.body.appendChild(t);
    }
    t.textContent = "Sent to agent \\u2713";
    t.style.opacity = "1";
    clearTimeout(window.__wfSentT);
    window.__wfSentT = setTimeout(function () { t.style.opacity = "0"; }, 1800);
  };
})();
<\/script>`;
}

function composeHtml(slug) {
  const f = store.get(slug);
  if (!f.model) return null;

  const modelJson = JSON.stringify(f.model, null, 2);
  let html = TEMPLATE_HTML.replace(
    /(<script[^>]+id="wf-model"[^>]*>)([\s\S]*?)(<\/script>)/,
    (_, open, _inner, close) => `${open}\n${modelJson}\n${close}`,
  );
  const boot = sseBootstrap(slug);
  html = html.includes("</body>")
    ? html.replace("</body>", boot + "\n</body>")
    : html + boot;
  return html;
}

function landingPage() {
  const slugs = store.listSlugs();
  const items = slugs.length
    ? slugs.map((s) => `<li><a href="/${encodeURIComponent(s)}/wireframe.html">${s}</a></li>`).join("")
    : "<li class=\"empty\">No wireframes open yet.</li>";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Proto-frames</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#3f3f46;background:#f4f4f5}
main{max-width:420px;padding:32px}h1{font-size:15px;font-weight:600;margin-bottom:12px}ul{list-style:none}li{padding:6px 0;border-bottom:1px dashed #d4d4d8}li.empty{color:#a1a1aa;font-style:italic;border-bottom:none}a{color:#0988c8;text-decoration:none;font-size:13px}a:hover{text-decoration:underline}</style>
</head><body><main><h1>proto-frames — active wireframes</h1><ul>${items}</ul></main></body></html>`;
}

function handleRequest(req, res) {
  const url = new URL(req.url, "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[0];
  const file = parts[1] || "wireframe.html";
  debug("http", `${req.method} ${url.pathname}`, { slug, hasModel: !!(slug && store.has(slug) && store.get(slug).model) });

  if (!slug) {
    res.writeHead(200, { "content-type": MIME[".html"] }).end(landingPage());
    return;
  }

  // Only routes for a feature slug that was actually opened via wireframe_open
  // get past this point — everything else (favicon.ico, typos, scans) is a
  // plain 404 instead of silently creating a phantom store entry that would
  // otherwise sit forever showing an infinite-refresh "waiting" page.
  if (!store.has(slug)) {
    res.writeHead(404).end("Not found");
    return;
  }

  if (file === "events" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    res.write("data: " + JSON.stringify({ type: "connected" }) + "\n\n");

    const history = getAll();
    if (history.length) {
      res.write("data: " + JSON.stringify({ type: "log-history", entries: history }) + "\n\n");
    }

    const f = store.get(slug);
    f.clients.add(res);

    req.on("close", () => {
      f.clients.delete(res);
      info("sse", `client disconnected`, { slug, clientsLeft: f.clients.size });
    });
    info("sse", `client connected`, { slug, totalClients: f.clients.size });
    return;
  }

  if (file === "feedback" && req.method === "POST") {
    // Content-Type must be exactly application/json: a cross-origin page can
    // send a CORS "simple request" (text/plain, form-urlencoded, ...) without
    // a preflight, so rejecting anything else blocks that vector outright.
    const contentType = (req.headers["content-type"] || "").split(";")[0].trim();
    if (contentType !== "application/json") {
      warn("http", `feedback POST rejected — bad content-type`, { slug, contentType });
      res.writeHead(415).end("Content-Type must be application/json");
      return;
    }
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.token !== SESSION_TOKEN) {
          warn("http", `feedback POST rejected — bad session token`, { slug });
          res.writeHead(403).end("Invalid session token");
          return;
        }
        if (typeof parsed.block === "string") {
          store.ingestBlock(slug, parsed.block);
          res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(400).end("Missing block");
        }
      } catch (err) {
        res.writeHead(400).end("Invalid JSON");
      }
    });
    return;
  }

  const f = store.get(slug);
  if (!f || !f.model) {
    const waiting = `<!doctype html><html><head><meta charset="utf-8"><title>Wireframe</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#71717a;background:#f4f4f5}
@keyframes s{to{transform:rotate(360deg)}}</style></head><body>
<svg width="20" height="20" viewBox="0 0 20 20" style="animation:s .8s linear infinite"><circle cx="10" cy="10" r="8" fill="none" stroke="#d4d4d8" stroke-width="2"/><path d="M10 2a8 8 0 0 1 8 8" fill="none" stroke="#3f3f46" stroke-width="2" stroke-linecap="round"/></svg>
<div style="font-size:13px;font-weight:500">Waiting for wireframe model…</div>
<div style="font-size:11px;color:#a1a1aa">The agent is building the wireframe. This page will refresh automatically.</div>
<script>setTimeout(function(){location.reload()},2000)</script></body></html>`;
    res.writeHead(200, { "content-type": MIME[".html"] }).end(waiting);
    return;
  }

  if (file === "wireframe.html") {
    const html = composeHtml(slug);
    res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-store" }).end(html);
    return;
  }
  if (file === "wireframe.css") {
    res.writeHead(200, { "content-type": MIME[".css"] }).end(CACHED_CSS);
    return;
  }
  if (file === "wireframe-app.js") {
    res.writeHead(200, { "content-type": MIME[".js"] }).end(CACHED_JS);
    return;
  }

  res.writeHead(404).end("Not found");
}

export function start() {
  if (httpServer) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const server = http.createServer(handleRequest);

    onLog((entry) => {
      store.broadcastLog(entry);
    });

    const heartbeat = setInterval(() => {
      store.keepAlive();
    }, 25000);
    server.on("close", () => clearInterval(heartbeat));

    // Without this, a bad WF_PORT (e.g. already in use) leaves the promise
    // pending forever instead of surfacing the failure to the MCP tool call.
    server.on("error", (err) => {
      clearInterval(heartbeat);
      httpServer = null;
      warn("http", `server failed to start`, { error: err.message });
      reject(err);
    });

    const port = process.env.WF_PORT ? parseInt(process.env.WF_PORT, 10) : 0;
    server.listen(port, "127.0.0.1", () => {
      httpServer = server;
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      info("http", `server listening on ${baseUrl}`);
      resolve();
    });
  });
}

export function openInBrowser(url) {
  if (process.env.WF_NO_OPEN) return;
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
      process.platform === "win32" ? `start "" "${url}"` :
        `xdg-open "${url}"`;
  exec(cmd, () => { });
}
