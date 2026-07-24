import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchLine } from "../../sketch/SketchLine";

export function StepperBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const isSketch = wf.drawMode() === "sketch";

  const steps = n.steps || [];
  const activeStep = n.activeStep ?? 0;

  const box = (
    <div
      className={
        "wf-box wf-stepper-box flex flex-col justify-center items-stretch py-2 px-3 min-h-0 " +
        modClasses(n)
      }
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-stepper-content flex flex-row items-center justify-between w-full gap-2 overflow-x-auto">
        {steps.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          const isPending = i > activeStep;
          const isLast = i === steps.length - 1;

          let statusClass = "wf-step-pending";
          let circleIndicator = "○";
          if (isDone) {
            statusClass = "wf-step-done";
            circleIndicator = "●";
          } else if (isActive) {
            statusClass = "wf-step-active";
            circleIndicator = "◉";
          }

          return (
            <div
              key={i}
              className={
                "wf-stepper-step-wrapper flex items-center gap-2 " +
                (isLast ? "flex-none" : "flex-1")
              }
            >
              <div
                className={
                  "wf-stepper-step flex items-center gap-1.5 whitespace-nowrap " +
                  statusClass
                }
              >
                <span className="wf-step-icon leading-none">
                  {circleIndicator}
                </span>
                <span className="wf-step-label">{step}</span>
              </div>
              {!isLast && (
                <div
                  className={
                    "wf-stepper-connector h-[2px] flex-1 min-w-[16px] relative" +
                    (i < activeStep ? " wf-connector-filled" : "")
                  }
                >
                  {isSketch && <SketchLine edge="top" />}
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
