import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder } from "../../SketchBorder";

export function ToggleBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const isSketch = wf.drawMode() === "sketch";

  const isChecked = !!n.checked;

  const box = (
    <div
      className={"wf-box wf-toggle-box flex items-center justify-start py-2 px-3 min-h-0 " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-toggle-content flex items-center gap-2">
        <div className={"wf-toggle-switch w-9 h-5 p-0.5 relative" + (isChecked ? " wf-toggle-checked" : "")}>
          {isSketch && <SketchBorder />}
          <div className="wf-toggle-knob w-3.5 h-3.5 rounded-full" />
        </div>
        <span className="wf-toggle-label">{n.toggleLabel || n.label}</span>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
