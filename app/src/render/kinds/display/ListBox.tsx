import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";
import { useSketchLine } from "../../sketch/SketchLine";

export function ListBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const headerLine = useSketchLine({ edge: "bottom" });
  const items = n.items || [];

  const box = (
    <div
      className={"wf-box wf-list-box flex flex-col items-stretch justify-start text-left p-3.5 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-list-content flex flex-col w-full gap-2">
        {n.label && (
          <div className="wf-list-header pb-1.5 border-b border-[var(--wf-c-line)] relative">
            {headerLine}
            {n.label}
          </div>
        )}
        <ul className="wf-list-items list-none p-0 m-0 flex flex-col">
          {items.map((item, idx) => (
            <li key={idx} className="wf-list-item flex items-center gap-2 py-2 px-0 border-b border-[var(--wf-c-line)] last:border-b-0">
              <span className="wf-list-bullet">•</span>
              <span className="wf-list-text flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
