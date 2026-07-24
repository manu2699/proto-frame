import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function SidebarBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const groups = n.sidebarGroups || [];
  const activeItem = n.activeItem;

  const box = (
    <div
      className={"wf-box wf-sidebar-box flex flex-col items-stretch justify-start text-left p-3 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-sidebar-content flex flex-col gap-4 w-full">
        {groups.map((group, gi) => (
          <div key={gi} className="wf-sidebar-group flex flex-col gap-1.5">
            {group.label && <div className="wf-sidebar-group-label pl-2">{group.label}</div>}
            <div className="wf-sidebar-items flex flex-col gap-1">
              {group.items.map((item, ii) => {
                const isActive = item === activeItem;
                return (
                  <div
                    key={ii}
                    className={"wf-sidebar-item py-1.5 px-2 rounded-[var(--wf-radius)]" + (isActive ? " wf-sidebar-active" : "")}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
