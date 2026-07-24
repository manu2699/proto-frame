import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";
import { SketchCheckbox } from "../../sketch/SketchGlyph";

export function CheckboxGroupBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";

  const options = n.options || [];
  const checkedItems = n.checkedItems || [];

  const box = (
    <div
      className={"wf-box wf-checkbox-group-box flex flex-col items-stretch justify-start text-left p-3 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-checkboxgroup-content flex flex-col gap-1.5">
        {n.label && <span className="wf-checkboxgroup-header-label">{n.label}</span>}
        <div className="wf-checkboxgroup-options flex flex-col gap-2">
          {options.map((opt, i) => {
            const isChecked = checkedItems.includes(i);
            return (
              <div key={i} className="wf-checkboxgroup-row flex items-center gap-2">
                <span className="wf-checkboxgroup-indicator leading-none shrink-0">
                  {isSketch ? <SketchCheckbox checked={isChecked} /> : (isChecked ? "☑" : "☐")}
                </span>
                <span className="wf-checkboxgroup-text">{opt}</span>
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
