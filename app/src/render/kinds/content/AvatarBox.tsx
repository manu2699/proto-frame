import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function AvatarBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const box = (
    <div
      className={"wf-box wf-avatar-box flex flex-col items-center justify-center p-3 min-h-[56px] " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-avatar-content flex flex-col items-center gap-1.5">
        <div className="wf-avatar-circle w-10 h-10 rounded-full flex items-center justify-center">
          <span className="wf-avatar-initials">{n.initials}</span>
        </div>
        {n.label && <span className="wf-avatar-label">{n.label}</span>}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
