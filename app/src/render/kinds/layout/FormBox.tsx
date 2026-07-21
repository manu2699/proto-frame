import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";
import { LINE_BOWING, LINE_ROUGHNESS } from "../../sketch/roughDraw";

export function FormBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";
  const fields = n.fields || [];

  const fcols = Math.max(...fields.map((f) => f.cols || 1), 1);

  const box = (
    <div
      className={"wf-box wf-form-box flex flex-col items-stretch justify-start text-left p-4 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-form-content flex flex-col gap-3 w-full">
        {n.label && <span className="wf-form-title">{n.label}</span>}
        <div
          className="grid gap-3 w-full"
          style={{ gridTemplateColumns: `repeat(${fcols}, minmax(0, 1fr))` }}
        >
          {fields.map((f, idx) => {
            const fieldType = f.type || "text";
            return (
              <div 
                key={idx} 
                className={`wf-form-field flex flex-col gap-1 w-full wf-field-type-${fieldType}`}
                style={f.cols ? { gridColumn: `span ${f.cols}` } : undefined}
              >
                <label className="wf-field-label">{f.label}</label>
                {fieldType === "text" && (
                  <div className="wf-field-input wf-input-text h-8 w-full relative">
                    {isSketch && <SketchBorder />}
                  </div>
                )}
                {fieldType === "select" && (
                  <div className="wf-field-input wf-input-select h-8 w-full relative flex items-center justify-end pr-2">
                    {isSketch && <SketchBorder />}
                    <span className="wf-select-arrow">▾</span>
                  </div>
                )}
                {fieldType === "textarea" && (
                  <div className="wf-field-input wf-input-textarea h-16 w-full relative">
                    {isSketch && <SketchBorder />}
                  </div>
                )}
                {fieldType === "toggle" && (
                  <div className="wf-field-toggle-container flex items-center h-8">
                    <div className={"wf-toggle-switch w-9 h-5 relative p-0.5" + (f.checked ? " wf-toggle-checked" : "")}>
                      {isSketch && <SketchBorder roughness={LINE_ROUGHNESS} bowing={LINE_BOWING} />}
                      <div className="wf-toggle-knob w-3.5 h-3.5 rounded-full" />
                    </div>
                  </div>
                )}
                {fieldType === "datepicker" && (
                  <div className="wf-field-input wf-datepicker-field flex justify-between items-center px-2.5 h-8 relative">
                    {isSketch && <SketchBorder />}
                    <span className="wf-datepicker-value">{f.dateValue || "Select date..."}</span>
                    <svg className="wf-datepicker-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "14px", height: "14px", color: "var(--wf-muted)" }}>
                      <rect x="2" y="3" width="12" height="11" rx="1" />
                      <line x1="2" y1="6" x2="14" y2="6" />
                      <line x1="5" y1="1" x2="5" y2="3" />
                      <line x1="11" y1="1" x2="11" y2="3" />
                    </svg>
                  </div>
                )}
                {fieldType === "upload" && (
                  <div className="wf-field-input wf-upload-field flex flex-col items-center justify-center min-h-[80px] p-2.5 w-full relative">
                    {isSketch && <SketchBorder />}
                    <svg className="wf-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "24px", height: "24px", color: "var(--wf-muted)", marginBottom: "4px" }}>
                      <path d="M18 10h-.7c-.3-2.5-2.4-4.5-4.9-4.5-2.2 0-4.1 1.5-4.7 3.6-2.1.3-3.7 2.1-3.7 4.3C4 15.8 6.2 18 9 18h9c2.2 0 4-1.8 4-4s-1.8-4-4-4z" />
                      <path d="M12 12v4M10 14l2-2 2 2" />
                    </svg>
                    <span className="wf-upload-label" style={{ fontSize: "10.5px", color: "var(--wf-muted)" }}>{f.uploadLabel || "Upload file..."}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {n.submitLabel && (
          <div className="wf-form-footer flex justify-end pt-1">
            <div
              className="wf-box wf-button-box wf-solid rounded-[6px] py-1 px-2 min-h-[26px] inline-flex items-center justify-center self-start h-max"
              style={{ alignSelf: "flex-end" }}
              data-kind="button"
            >
              <span className="wf-button-label">{n.submitLabel}</span>
            </div>
          </div>
        )}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
