import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";

export function ProgressBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";

  const percent = Math.min(100, Math.max(0, n.percent ?? 0));

  const box = (
    <div
      className={"wf-box wf-progress-box flex flex-col items-stretch justify-center p-3 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-progress-content flex flex-col gap-1.5 w-full">
        <div className="wf-progress-header flex justify-between items-baseline">
          {n.label && <span className="wf-progress-label">{n.label}</span>}
          <span className="wf-progress-text">{percent}%</span>
        </div>
        <div className="wf-progress-track h-2 w-full overflow-hidden relative">
          {isSketch && <SketchBorder />}
          {percent > 0 && (
            <div className="wf-progress-fill h-full relative" style={{ width: `${percent}%` }}>
              {isSketch && <SketchBorder fill="var(--wf-ink)" stroke="var(--wf-ink)" fillStyle="hachure" />}
            </div>
          )}
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
