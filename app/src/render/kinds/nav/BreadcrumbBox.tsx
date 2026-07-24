import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function BreadcrumbBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const crumbs = n.crumbs || [];

  const box = (
    <div
      className={"wf-box wf-breadcrumb-box flex flex-row items-center justify-start py-2 px-3 min-h-0 " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-breadcrumb-content flex flex-wrap items-center gap-1">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="wf-breadcrumb-item-wrapper inline-flex items-center gap-1">
              <span className={"wf-breadcrumb-item" + (isLast ? " wf-breadcrumb-active" : "")}>
                {crumb}
              </span>
              {!isLast && <span className="wf-breadcrumb-separator mx-[2px]">›</span>}
            </span>
          );
        })}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
