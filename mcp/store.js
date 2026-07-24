/**
 * FeatureStore — in-memory state for wireframe features.
 *
 * Each feature (keyed by slug) holds:
 *   model        – the WFModel JSON object
 *   queue        – feedback/approval blocks waiting to be read by the agent
 *   waiters      – resolve fns from pending wireframe_wait_feedback calls
 *   approved     – flipped true when the browser sends an APPROVED block
 *   openComments – extracted from the most recent block
 *   clients      – active SSE client response streams for this feature
 */

import { info, warn } from "./log.js";

const features = new Map();

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "wireframe";
}

export function get(slug) {
  let f = features.get(slug);
  if (!f) {
    f = { model: null, queue: [], waiters: [], approved: false, openComments: 0, clients: new Set() };
    features.set(slug, f);
  }
  return f;
}

// Read-only existence check — unlike get(), never creates a phantom entry.
// Used to tell "unknown route" (404) apart from "feature exists, model not
// set yet" (waiting page) without every stray request (favicon.ico, a typo'd
// slug, a port scan) leaving a permanent entry in the feature map.
export function has(slug) {
  return features.has(slug);
}

export function listSlugs() {
  return [...features.keys()];
}

export function setModel(slug, model) {
  const f = get(slug);
  const screenCount = model?.screens?.length || 0;
  const modalCount = model?.modals?.length || 0;
  info("store", `setModel "${slug}"`, { screens: screenCount, modals: modalCount });
  f.model = model;
  return f;
}

/**
 * Validate and normalize a model object.
 * Unwraps accidental `{ model: { screens } }` nesting.
 * Returns `{ ok: true, model }` or `{ ok: false, error }`.
 */
export function validateModel(raw) {
  let model = raw;
  // Accept model passed as a JSON string (alternative encoding for large/complex models).
  if (typeof model === "string") {
    try {
      model = JSON.parse(model);
    } catch (e) {
      return { ok: false, error: `model string could not be parsed as JSON: ${e.message}` };
    }
  }
  if (model && !Array.isArray(model.screens) && model.model && Array.isArray(model.model.screens)) {
    warn("store", "model nested under 'model' key — unwrapping");
    model = model.model;
  }
  if (!model || !Array.isArray(model.screens)) {
    return {
      ok: false,
      error:
        `model.screens is ${!model ? "missing" : `not an array (got ${typeof model.screens})`}.\n` +
        `Pass the full WFModel object (with a "screens" array) as the "model" argument, not a wrapper around it.`,
    };
  }
  return { ok: true, model, warnings: collectWarnings(model) };
}

/**
 * Non-fatal structural checks: dangling goto/opens targets and duplicate ids.
 * These don't block the render (the browser degrades gracefully — a dangling
 * goto is just a click that does nothing) but the agent should know so it can
 * self-correct instead of the user finding a dead click during review.
 */
function collectWarnings(model) {
  const warnings = [];
  const screenIds = new Set();
  const modalIds = new Set();

  for (const sc of model.screens || []) {
    if (sc.id && screenIds.has(sc.id)) warnings.push(`duplicate screen id "${sc.id}"`);
    if (sc.id) screenIds.add(sc.id);
  }
  for (const md of model.modals || []) {
    if (md.id && modalIds.has(md.id)) warnings.push(`duplicate modal id "${md.id}"`);
    if (md.id) modalIds.add(md.id);
  }

  const visit = (n, where) => {
    if (!n || typeof n !== "object") return;
    if (n.goto && !screenIds.has(n.goto)) warnings.push(`"${where}" has goto:"${n.goto}" — no screen with that id`);
    if (n.opens && !modalIds.has(n.opens)) warnings.push(`"${where}" has opens:"${n.opens}" — no modal with that id`);
    if (n.type === "nav") {
      for (const g of n.groups || []) {
        for (const it of g.items || []) visit(it, where);
      }
    }
    for (const c of n.children || []) visit(c, where);
  };

  for (const sc of model.screens || []) {
    for (const st of sc.states ?? []) for (const n of st.nodes || []) visit(n, `screen "${sc.name || sc.id}"`);
    for (const n of sc.nodes || []) visit(n, `screen "${sc.name || sc.id}"`);
  }
  for (const md of model.modals || []) {
    for (const n of md.nodes || []) visit(n, `modal "${md.name || md.id}"`);
  }

  return warnings;
}

/**
 * Classify an incoming block from the browser, update status, and route it
 * to a waiting agent call or queue it.
 */
export function ingestBlock(slug, block) {
  const f = get(slug);
  const isApproval = /^=====\s*WIREFRAME APPROVED/m.test(block);
  const isFeedback = /^=====\s*WIREFRAME FEEDBACK/m.test(block);
  const type = isApproval ? "approval" : isFeedback ? "feedback" : "unknown";
  info("store", `ingestBlock "${slug}" type=${type}`, { waiters: f.waiters.length, queueLen: f.queue.length, blockLen: block.length });

  if (isApproval) {
    f.approved = true;
    const m = block.match(/(\d+)\s+open comment/);
    if (m) f.openComments = parseInt(m[1], 10);
  } else if (isFeedback) {
    const m = block.match(/END FEEDBACK \((\d+)\s+item/);
    if (m) f.openComments = parseInt(m[1], 10);
  }
  const waiter = f.waiters.shift();
  if (waiter) {
    info("store", `block delivered to waiting agent`, { slug });
    waiter(block);
  } else {
    info("store", `block queued (no waiter)`, { slug, queueLen: f.queue.length + 1 });
    f.queue.push(block);
  }
}

export function drainQueue(slug) {
  const f = get(slug);
  return f.queue.splice(0);
}

export function waitForBlock(slug, timeoutMs = 3600000) {
  const f = get(slug);
  if (f.queue.length) {
    info("store", `waitForBlock "${slug}" — drained from queue`, { queueLen: f.queue.length - 1 });
    return Promise.resolve(f.queue.shift());
  }
  info("store", `waitForBlock "${slug}" — waiting`, { timeoutMs, existingWaiters: f.waiters.length });
  return new Promise((resolve) => {
    const onBlock = (b) => { clearTimeout(timer); resolve(b); };
    let timer;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        const i = f.waiters.indexOf(onBlock);
        if (i !== -1) f.waiters.splice(i, 1);
        warn("store", `waitForBlock "${slug}" timed out after ${timeoutMs}ms`);
        resolve(null);
      }, timeoutMs);
    }
    f.waiters.push(onBlock);
  });
}

export function broadcast(slug, msg) {
  const f = features.get(slug);
  if (!f) return;
  const payload = JSON.stringify(msg);
  let sent = 0;
  for (const res of f.clients) {
    try {
      if (!res.writableEnded) {
        res.write("data: " + payload + "\n\n");
        sent++;
      }
    } catch (_) { }
  }
  info("store", `broadcast "${slug}" type=${msg.type}`, { sent, total: f.clients.size });
}

export function broadcastLog(entry) {
  const payload = JSON.stringify({ type: "log", entry });
  for (const f of features.values()) {
    for (const res of f.clients) {
      try {
        if (!res.writableEnded) {
          res.write("data: " + payload + "\n\n");
        }
      } catch (_) { }
    }
  }
}

export function getAllClients() {
  const all = [];
  for (const f of features.values()) {
    for (const res of f.clients) {
      all.push(res);
    }
  }
  return all;
}

export function keepAlive() {
  for (const f of features.values()) {
    for (const res of f.clients) {
      try {
        if (!res.writableEnded) {
          res.write(":\n\n");
        }
      } catch (_) { }
    }
  }
}
