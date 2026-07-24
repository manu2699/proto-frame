import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function SearchBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const box = (
    <div
      className={"wf-box wf-search-box flex flex-col items-stretch justify-start text-left py-2.5 px-3 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-search-content w-full flex flex-col gap-2">
        <div className="wf-search-input-container flex items-center gap-2 py-1.5 px-2.5 h-8">
          <svg className="wf-search-icon w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <span className="wf-search-placeholder">{n.placeholder || "Search..."}</span>
        </div>
        {n.filters && n.filters.length > 0 && (
          <div className="wf-search-filters flex flex-wrap gap-1.5">
            {n.filters.map((filter, i) => (
              <span key={i} className="wf-search-filter-chip py-0.5 px-2 rounded-full">
                {filter}
              </span>
            ))}
          </div>
        )}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
