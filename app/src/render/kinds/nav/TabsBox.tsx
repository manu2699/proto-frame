import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function TabsBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const tabs = n.tabs || [];
  const activeTab = n.activeTab !== undefined ? n.activeTab : 0;
  const sketchBorder = useSketchBorder();

  const box = (
    <div
      className={"wf-box wf-tabs-box flex flex-row items-center justify-start px-3 py-0 min-h-[40px] w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-tabs-container flex flex-row gap-4 w-full h-full items-center overflow-x-auto">
        {tabs.map((tab, idx) => {
          const isActive = idx === activeTab;
          return (
            <div
              key={idx}
              className={`wf-tab-item py-2.5 px-1 border-b-2 border-transparent whitespace-nowrap ${isActive ? "wf-tab-active" : ""}`}
            >
              {tab}
            </div>
          );
        })}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
