// Table block: header row + placeholder body rows. Commentable as a whole.

import type { CSSProperties } from "react";
import type { WFNode } from "../types";
import { Pin } from "./Pin";
import { useWF, handleClick } from "./context";
import { withAnnotation } from "./Box";

export function Table(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const cols = n.headers?.length || (n.rows?.[0]?.length ?? 3);
  const table = (
    <div
      className="wf-box block p-0 min-h-0 text-left overflow-visible"
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      {n.label && <span className="wf-table-label">{n.label}</span>}
      {n.headers && (
        <div
          className="grid border-t border-[var(--wf-c-line)] first:border-t-0"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {n.headers.map((h, i) => (
            <div
              key={i}
              className="wf-th py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {h}
              {n.sortable && (
                <span className="wf-sort-indicator">
                  {n.sortCol === i ? (n.sortDir === "asc" ? " ▲" : " ▼") : " ↕"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {n.rows?.map((r, ri) => (
        <div
          key={ri}
          className="grid border-t border-[var(--wf-c-line)] first:border-t-0"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {r.map((c, ci) => (
            <div
              key={ci}
              className="wf-td wf-placeholder py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
  return withAnnotation(table, n);
}
