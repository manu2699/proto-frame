import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";
import { useSketchLine } from "../../sketch/SketchLine";

export function TimelineBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const timelineLine = useSketchLine({ edge: "left" });

  const events = n.events || [];

  const box = (
    <div
      className={"wf-box wf-timeline-box flex flex-col items-stretch justify-start text-left py-4 px-3.5 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-timeline-content flex flex-col gap-4 w-full relative">
        <div className="wf-timeline-line absolute left-1.5 top-1 bottom-1 w-0.5">
          {timelineLine}
        </div>
        {events.map((event, i) => (
          <div key={i} className="wf-timeline-event flex items-start gap-3 w-full relative z-10">
            <div className="wf-timeline-dot w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full" />
            <div className="wf-timeline-event-content flex flex-col gap-0.5">
              <span className="wf-timeline-event-label">{event.label}</span>
              {event.meta && <span className="wf-timeline-event-meta">{event.meta}</span>}
            </div>
          </div>
        ))}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
