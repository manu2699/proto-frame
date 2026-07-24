import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function UploadBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const box = (
    <div
      className={"wf-box wf-upload-box flex flex-col items-center justify-center p-5 w-full min-h-[100px] " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-upload-content flex flex-col items-center gap-2 text-center">
        <svg className="wf-upload-icon w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 10h-.7c-.3-2.5-2.4-4.5-4.9-4.5-2.2 0-4.1 1.5-4.7 3.6-2.1.3-3.7 2.1-3.7 4.3C4 15.8 6.2 18 9 18h9c2.2 0 4-1.8 4-4s-1.8-4-4-4z" />
          <path d="M12 12v4M10 14l2-2 2 2" />
        </svg>
        <span className="wf-upload-label">{n.uploadLabel || "Click or drag files to upload"}</span>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
