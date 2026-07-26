// Feedback / approval block builders. The FEEDBACK format is byte-identical to
// the original template (mcp/server.js regex-parses the header + item count).
// APPROVAL adds an optional `flow=` column, additively — header/count unchanged.
//
// `metaOf` is injected (not imported from a global) so these stay pure functions
// of their inputs.

import type { Comment, WFModel, WFNode } from "../types";
import type { IdMeta } from "../model/stamp";

type MetaLookup = (id: string) => IdMeta | undefined;

interface Annotated {
  id: string;
  label: string;
  screen: string;
  state: string;
  backend?: string;
  ds?: string;
  flow?: string;
}

function flowOf(n: { goto?: string; opens?: string; action?: string }): string | undefined {
  if (n.goto) return "goto " + n.goto;
  if (n.opens) return "opens " + n.opens;
  if (n.action) return n.action;
  return undefined;
}

// Collect every annotated (backend/ds/flow) element in stable id order.
export function collectAnnotated(model: WFModel, metaOf: MetaLookup): Annotated[] {
  const out: Annotated[] = [];
  const visit = (n: WFNode & { _id?: string }) => {
    if (n.type === "nav") {
      for (const g of n.groups || []) {
        for (const it of (g.items || []) as Array<any>) {
          if (it.backend || it.ds || it.goto || it.opens) {
            const m = metaOf(it._id);
            out.push({
              id: it._id, label: m?.label ?? it.text, screen: m?.screen ?? "", state: m?.state ?? "",
              backend: it.backend, ds: it.ds, flow: flowOf(it),
            });
          }
        }
      }
    } else if (n._id && (n.backend || n.ds || n.goto || n.opens || n.action)) {
      const m = metaOf(n._id);
      out.push({
        id: n._id, label: m?.label ?? n.label ?? "", screen: m?.screen ?? "", state: m?.state ?? "",
        backend: n.backend, ds: n.ds, flow: flowOf(n),
      });
    }
    for (const c of n.children || []) visit(c);
  };
  for (const sc of model.screens) for (const st of sc.states ?? []) for (const n of st.nodes) visit(n);
  for (const md of model.modals || []) for (const n of md.nodes) visit(n);
  return out;
}

export function buildFeedback(feature: string, comments: Record<string, Comment>, order: string[]): string | null {
  const ids = order.filter((id) => comments[id]);
  if (!ids.length) return null;
  const lines = [
    "===== WIREFRAME FEEDBACK: " + feature + " =====",
    "Apply ONLY these changes. Do not modify any element not listed below.",
    "Match each item by its id (the label is for human reference). Each item is",
    "scoped to one screen and state — edit it only there.",
    "",
  ];
  ids.forEach((id) => {
    const c = comments[id];
    lines.push('[#' + c.id + '] label="' + c.label + '" | screen="' + c.screen + '" | state="' + (c.state || "default") + '"');
    lines.push("  → " + c.text);
    lines.push("");
  });
  lines.push("===== END FEEDBACK (" + ids.length + " item" + (ids.length === 1 ? "" : "s") + ") =====");
  return lines.join("\n");
}

function collectFormFields(nodes: WFNode[]): Array<{ screen: string; label: string; fields: string[] }> {
  const out: Array<{ screen: string; label: string; fields: string[] }> = [];
  const visit = (n: WFNode, ctx: string) => {
    if (n.kind === "form" && n.fields?.length) {
      out.push({
        screen: ctx,
        label: n.label || "Form",
        fields: n.fields.map((f) => f.label + (f.type ? " (" + f.type + ")" : "")),
      });
    }
    for (const c of n.children || []) visit(c, ctx);
  };
  for (const n of nodes) visit(n, "");
  return out;
}

function collectNewChanged(model: WFModel, metaOf: MetaLookup): Array<{ id: string; label: string; screen: string; marker: string }> {
  const out: Array<{ id: string; label: string; screen: string; marker: string }> = [];
  const visit = (n: WFNode & { _id?: string }, screen: string) => {
    if (n._id && (n.new || n.changed)) {
      const m = metaOf(n._id);
      out.push({ id: n._id, label: m?.label ?? n.label ?? "", screen: m?.screen ?? screen, marker: n.new ? "new" : "changed" });
    }
    for (const c of n.children || []) visit(c, screen);
  };
  for (const sc of model.screens) for (const st of sc.states ?? []) for (const n of st.nodes) visit(n, sc.name);
  for (const md of model.modals || []) for (const n of md.nodes) visit(n, md.name);
  return out;
}

function buildScreensSection(model: WFModel): string[] {
  const lines: string[] = ["## Screens"];
  for (const sc of model.screens) {
    const role = sc.role ? " [" + sc.role + "]" : "";
    const stateNames = (sc.states || []).map((st) => st.id).filter((id) => id !== "default");
    const stateStr = stateNames.length ? " (states: default, " + stateNames.join(", ") + ")" : "";
    lines.push("- " + sc.id + ": " + sc.name + role + stateStr);
  }
  lines.push("");
  return lines;
}

function buildModalsSection(model: WFModel): string[] {
  if (!model.modals?.length) return [];
  const lines: string[] = ["## Modals"];
  for (const md of model.modals) {
    const forms = collectFormFields(md.nodes);
    lines.push("- " + md.id + ": " + md.name);
    for (const f of forms) {
      lines.push("  Fields: " + f.fields.join(", "));
    }
  }
  lines.push("");
  return lines;
}

function buildFlowSection(model: WFModel): string[] {
  if (!model.flows?.length) return [];
  const lines: string[] = ["## Flow"];
  for (const f of model.flows) {
    lines.push("- " + f.from + " → [" + f.via + "] → " + f.to);
  }
  lines.push("");
  return lines;
}

function buildNewChangedSection(model: WFModel, metaOf: MetaLookup): string[] {
  const nc = collectNewChanged(model, metaOf);
  if (!nc.length) return [];
  const lines: string[] = ["## New & Changed Elements"];
  for (const el of nc) {
    lines.push("- [#" + el.id + '] "' + el.label + '" on ' + el.screen + " — ✦ " + el.marker);
  }
  lines.push("");
  return lines;
}

function buildFormFieldsSection(model: WFModel): string[] {
  const allForms: Array<{ screen: string; label: string; fields: string[] }> = [];
  for (const sc of model.screens) {
    for (const st of sc.states ?? []) {
      const found = collectFormFields(st.nodes);
      for (const f of found) f.screen = sc.name;
      allForms.push(...found);
    }
  }
  if (!allForms.length) return [];
  const lines: string[] = ["## Form Fields (in-screen)"];
  for (const f of allForms) {
    lines.push("- " + f.screen + " / " + f.label + ": " + f.fields.join(", "));
  }
  lines.push("");
  return lines;
}

function buildMappingSection(boxes: Annotated[], openCount: number): string[] {
  const lines: string[] = ["## Mapping (id | label | screen | state | backend | design-system | flow)"];
  boxes.forEach((b) => {
    let line =
      '[#' + b.id + '] label="' + b.label + '"' +
      ' | screen="' + b.screen + '"' +
      ' | state="' + (b.state || "default") + '"' +
      ' | API="' + (b.backend || "—") + '"' +
      ' | COMPONENT="' + (b.ds || "—") + '"';
    if (b.flow) line += ' | FLOW="' + b.flow + '"';
    lines.push(line);
  });
  lines.push("");
  lines.push(openCount
    ? "⚠ " + openCount + " comment" + (openCount === 1 ? "" : "s") + " still open — resolve or confirm before building."
    : "No open comments.");
  return lines;
}

export function buildApproval(model: WFModel, comments: Record<string, Comment>, metaOf: MetaLookup): string {
  const boxes = collectAnnotated(model, metaOf);
  const openCount = Object.keys(comments).length;
  const lines = [
    "===== WIREFRAME APPROVED: " + model.feature + " =====",
    "This LOW-FIDELITY wireframe is approved as the agreed understanding of the",
    "feature's UI/UX — which screens exist and how each changed piece maps to the",
    "backend and the design system. NOT an implementation or visual spec.",
    "Next: turn the mapping below into an implementation PLAN, then wait for greenlight.",
    "Also persist this as the approved feature-spec.",
    "",
  ];

  // Change summary
  if (model.change) {
    lines.push("Change: " + model.change);
    lines.push("");
  }

  lines.push(...buildScreensSection(model));
  lines.push(...buildModalsSection(model));
  lines.push(...buildFlowSection(model));
  lines.push(...buildNewChangedSection(model, metaOf));
  lines.push(...buildFormFieldsSection(model));
  lines.push(...buildMappingSection(boxes, openCount));
  lines.push("===== END APPROVAL (" + boxes.length + " mapped box" + (boxes.length === 1 ? "" : "es") + ", " + openCount + " open comment" + (openCount === 1 ? "" : "s") + ") =====");
  return lines.join("\n");
}
