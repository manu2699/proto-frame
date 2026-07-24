import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function BadgeBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const variant = n.variant || "default";
  const isError = variant === "error";
  const paddingCls = isError ? "py-0 px-2" : "py-0.5 px-2.5";

  const box = (
    <div
      className={`wf-box wf-badge-box wf-badge-${variant} inline-flex items-center justify-center min-h-[18px] ${paddingCls} rounded-full min-w-0 ${modClasses(n)}`}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <span className="wf-badge-text">{n.text || n.label}</span>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
