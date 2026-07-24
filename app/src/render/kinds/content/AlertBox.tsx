import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function AlertBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const alertType = n.alertType || "info";
  const isError = alertType === "error";
  const paddingCls = isError ? "py-2 px-2.5" : "py-2.5 px-3";

  const box = (
    <div
      className={`wf-box wf-alert-box wf-alert-${alertType} flex flex-row items-center justify-start ${paddingCls} w-full text-left rounded-[var(--wf-radius)] ${modClasses(n)}`}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-alert-content flex items-center gap-2">
        <span className="wf-alert-icon">[!]</span>
        <span className="wf-alert-message">{n.message || n.label}</span>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
