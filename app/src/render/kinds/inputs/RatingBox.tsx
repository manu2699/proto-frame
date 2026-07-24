import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function RatingBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const max = n.max || 5;
  const rating = n.rating ?? 0;

  const stars = Array.from({ length: max }, (_, i) => i);

  const box = (
    <div
      className={"wf-box wf-rating-box flex flex-col items-start justify-center p-3 min-h-0 " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-rating-content flex flex-col gap-1">
        {n.label && <span className="wf-rating-label">{n.label}</span>}
        <div className="wf-rating-stars flex flex-row gap-1">
          {stars.map((s) => {
            const isFilled = s < rating;
            return (
              <svg
                key={s}
                className={"wf-rating-star w-4 h-4" + (isFilled ? " wf-star-filled" : "")}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                fill={isFilled ? "currentColor" : "none"}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            );
          })}
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
