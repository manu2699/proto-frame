// Compact-syntax normalizer. Runs before stampModel on any model input.
// Expands the token-efficient shorthand the LLM agent writes:
//   A: $ref → shared fragment expansion
//   B: omitted type → inferred "box"
//   C: {row:[...]} / {col:[...]} → {type:"row/col", children:[...]}
//   D: screen.nodes (no states) → states:[{id:"default",...}]

import type { WFModel, WFNode } from "../types";

export function normalizeModel(raw: unknown): WFModel {
  const m = raw as WFModel;
  const shared = m.shared ?? {};

  // Guard: screens must be an array — the agent may send a malformed/partial
  // model (e.g. nested under a "model" key, or with screens missing entirely).
  if (!Array.isArray(m.screens)) {
    throw new Error(
      `wireframe: model.screens is ${m.screens == null ? "missing" : `not an array (got ${typeof m.screens})`}. ` +
      `Check that the agent passed the full model object, not a nested wrapper.`,
    );
  }

  for (const sc of m.screens) {
    const scAny = sc as any;
    // D: flatten single-state screens
    if (scAny.nodes && !sc.states) {
      sc.states = [{ id: "default", name: "Default", nodes: scAny.nodes }];
      delete scAny.nodes;
    }
    for (const st of sc.states ?? []) {
      st.nodes = (st.nodes ?? []).map((n) => normalizeNode(n, shared, []));
    }
  }
  for (const md of m.modals ?? []) {
    md.nodes = (md.nodes ?? []).map((n) => normalizeNode(n, shared, []));
  }
  return m;
}

function normalizeNode(raw: any, shared: Record<string, WFNode>, refChain: string[]): WFNode {
  if (!raw || typeof raw !== "object") return raw;

  // A: expand $ref
  if (raw.$ref) {
    if (refChain.includes(raw.$ref)) {
      throw new Error(
        `wireframe: $ref cycle detected: ${[...refChain, raw.$ref].join(" -> ")}. ` +
        `A shared fragment can't (directly or indirectly) reference itself.`,
      );
    }
    const frag = shared[raw.$ref];
    if (!frag) throw new Error(`wireframe: $ref "${raw.$ref}" not found in shared`);
    return normalizeNode({ ...frag }, shared, [...refChain, raw.$ref]);
  }

  // C: shorthand row
  if (Array.isArray(raw.row)) {
    const { row, ...rest } = raw;
    return normalizeNode({ type: "row", children: row, ...rest }, shared, refChain);
  }

  // C: shorthand col
  if (Array.isArray(raw.col)) {
    const { col, ...rest } = raw;
    return normalizeNode({ type: "col", children: col, ...rest }, shared, refChain);
  }

  // B: infer type:"box" when missing
  if (!raw.type) {
    raw = { ...raw, type: "box" };
  }

  // recurse children
  if (Array.isArray(raw.children)) {
    raw = { ...raw, children: raw.children.map((c: any) => normalizeNode(c, shared, refChain)) };
  }

  return raw as WFNode;
}
