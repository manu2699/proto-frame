import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";
import { SketchRadio } from "../../sketch/SketchGlyph";

export function RadioGroupBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";

  const options = n.options || [];
  const selected = n.selected ?? 0;

  const box = (
    <div
      className={"wf-box wf-radio-group-box flex flex-col items-stretch justify-start text-left p-3 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-radiogroup-content flex flex-col gap-1.5">
        {n.label && <span className="wf-radiogroup-header-label">{n.label}</span>}
        <div className="wf-radiogroup-options flex flex-col gap-2">
          {options.map((opt, i) => {
            const isSelected = i === selected;
            return (
              <div key={i} className="wf-radiogroup-row flex items-center gap-2">
                <span className="wf-radiogroup-indicator leading-none shrink-0">
                  {isSketch ? <SketchRadio selected={isSelected} /> : (isSelected ? "◉" : "○")}
                </span>
                <span className="wf-radiogroup-text">{opt}</span>
              </div>
            );
          })}
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
