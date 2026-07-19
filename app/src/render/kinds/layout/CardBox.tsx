import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { Node } from "../../Node";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";
import { useSketchLine } from "../../sketch/SketchLine";

export function CardBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const footerLine = useSketchLine({ edge: "top" });
  const isSketch = wf.drawMode() === "sketch";

  const hasMeta = n.meta && n.meta.length > 0;
  const hasBadges = n.badges && n.badges.length > 0;
  const hasStats = n.stats && n.stats.length > 0;

  const box = (
    <div
      className={"wf-box wf-card-box flex flex-col items-stretch justify-start text-left p-3.5 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-card-content flex flex-col gap-2.5 w-full">
        <div className="wf-card-header flex flex-col gap-0.5">
          <div className="wf-card-title">{n.title ?? n.label}</div>
        </div>

        {hasMeta && (
          <div className="wf-card-meta-row flex flex-wrap gap-2">
            {n.meta!.map((m, idx) => (
              <span key={idx} className="wf-card-meta-item">
                {m}
              </span>
            ))}
          </div>
        )}

        {hasBadges && (
          <div className="wf-card-badge-row flex flex-wrap gap-1.5">
            {n.badges!.map((b, idx) => (
              <span key={idx} className="wf-card-badge py-0.5 px-1.5 rounded-[4px] relative">
                {isSketch && <SketchBorder />}
                {b}
              </span>
            ))}
          </div>
        )}

        {n.children && n.children.length > 0 && (
          <div className="wf-card-children flex flex-col gap-3 mt-1 w-full">
            {n.children.map((child, idx) => (
              <Node key={child._id || idx} node={child} />
            ))}
          </div>
        )}

        {hasStats && (
          <div className="wf-card-footer flex justify-between items-center border-t border-[var(--wf-c-line)] pt-2 mt-0.5 relative">
            {footerLine}
            {n.stats!.map((s, idx) => (
              <span key={idx} className="wf-card-stat">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
