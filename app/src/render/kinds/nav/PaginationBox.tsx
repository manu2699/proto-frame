import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder } from "../../SketchBorder";

export function PaginationBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const isSketch = wf.drawMode() === "sketch";

  const totalPages = n.pages || 5;
  const current = n.current ?? 1;

  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  const box = (
    <div
      className={"wf-box wf-pagination-box flex items-center justify-center py-2 px-3 min-h-0 " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-pagination-content flex flex-row gap-1 items-center">
        <span className="wf-pagination-btn wf-pagination-nav inline-flex items-center justify-center min-w-[28px] h-7 relative">
          {isSketch && <SketchBorder />}
          ‹
        </span>
        {pagesArray.map((p) => {
          const isActive = p === current;
          return (
            <span
              key={p}
              className={"wf-pagination-btn inline-flex items-center justify-center min-w-[28px] h-7 relative" + (isActive ? " wf-pagination-active" : "")}
            >
              {isSketch && <SketchBorder />}
              {p}
            </span>
          );
        })}
        <span className="wf-pagination-btn wf-pagination-nav inline-flex items-center justify-center min-w-[28px] h-7 relative">
          {isSketch && <SketchBorder />}
          ›
        </span>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
