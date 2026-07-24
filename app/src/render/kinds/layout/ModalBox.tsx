import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { Node } from "../../Node";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";
import { useSketchLine } from "../../sketch/SketchLine";

export function ModalBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const headerLine = useSketchLine({ edge: "bottom" });
  const footerLine = useSketchLine({ edge: "top" });
  const isSketch = wf.drawMode() === "sketch";

  const footerButtons = n.modalFooter || [];

  const box = (
    <div
      className={"wf-box wf-modal-box flex flex-col items-stretch justify-start p-4 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-modal-content flex flex-col gap-3.5 w-full">
        <div className="wf-modal-header flex justify-between items-center border-b border-[var(--wf-c-line)] pb-2 relative">
          {headerLine}
          <span className="wf-modal-title">{n.modalTitle || n.label || "Modal Window"}</span>
          <span className="wf-modal-close">×</span>
        </div>
        <div className="wf-modal-body flex flex-col gap-2.5 w-full min-h-[60px]">
          {n.children && n.children.length > 0 ? (
            n.children.map((child, idx) => (
              <Node key={child._id || idx} node={child} />
            ))
          ) : (
            <div className="wf-modal-body-placeholder h-10" />
          )}
        </div>
        {footerButtons.length > 0 && (
          <div className="wf-modal-footer flex justify-end gap-2 border-t border-[var(--wf-c-line)] pt-2.5 relative">
            {footerLine}
            {footerButtons.map((btn, i) => (
              <span key={i} className="wf-modal-footer-btn py-1 px-2.5 rounded-[var(--wf-radius)] relative">
                {isSketch && <SketchBorder />}
                {btn}
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
