import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";

export function SliderBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";

  const min = n.min ?? 0;
  const max = n.max ?? 100;
  const val = n.sliderValue ?? 50;
  const pct = max > min ? Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100)) : 50;

  const box = (
    <div
      className={"wf-box wf-slider-box flex flex-col items-stretch justify-center p-3 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-slider-content flex flex-col gap-1.5 w-full">
        <div className="wf-slider-header flex justify-between items-baseline">
          {n.label && <span className="wf-slider-label">{n.label}</span>}
          <span className="wf-slider-value">{val}</span>
        </div>
        <div className="wf-slider-track h-1 w-full relative rounded-[2px]">
          {isSketch && <SketchBorder />}
          {pct > 0 && (
            <div className="wf-slider-track-fill h-full rounded-[2px] relative" style={{ width: `${pct}%` }}>
              {isSketch && <SketchBorder fill="var(--wf-ink)" stroke="var(--wf-ink)" fillStyle="hachure" />}
            </div>
          )}
          <div className="wf-slider-thumb w-3 h-3 absolute top-1/2 rounded-full" style={{ left: `${pct}%` }}>
            {isSketch && <SketchBorder shape="circle" />}
          </div>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
