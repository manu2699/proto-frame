import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";

export function AccordionBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";

  const sections = n.sections || [];

  const box = (
    <div
      className={"wf-box wf-accordion-box flex flex-col items-stretch justify-start p-3 w-full text-left " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-accordion-content flex flex-col gap-2 w-full">
        {sections.map((section, i) => {
          const isExpanded = !!section.expanded;
          return (
            <div key={i} className="wf-accordion-section flex flex-col relative">
              {isSketch && <SketchBorder />}
              <div className="wf-accordion-header flex justify-between items-center py-2 px-3">
                <span className="wf-accordion-title flex-1">{section.title}</span>
                <span className="wf-accordion-chevron">{isExpanded ? "▾" : "▸"}</span>
              </div>
              {isExpanded && (
                <div className="wf-accordion-body p-3">
                  <div className="wf-accordion-body-placeholder h-10" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
