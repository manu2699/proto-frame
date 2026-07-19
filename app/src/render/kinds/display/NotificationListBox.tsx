import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";
import { SketchLine } from "../../sketch/SketchLine";

export function NotificationListBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";

  const notifications = n.notifications || [];

  const box = (
    <div
      className={"wf-box wf-notification-list-box flex flex-col items-stretch justify-start text-left p-3 w-full " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-notification-list-content flex flex-col gap-2 w-full">
        {n.label && <span className="wf-notification-list-header-label border-b border-[var(--wf-c-line)] pb-1.5">{n.label}</span>}
        <div className="wf-notification-items flex flex-col">
          {notifications.map((item, i) => {
            const isUnread = !!item.unread;
            const isLast = i === notifications.length - 1;
            return (
              <div
                key={i}
                className={"wf-notification-item flex items-start gap-2 py-2 px-0 border-b border-[var(--wf-c-line)] last:border-b-0 relative" + (isUnread ? " wf-notification-unread" : "")}
              >
                {isSketch && !isLast && <SketchLine edge="bottom" />}
                <div className="wf-notification-indicator w-3 shrink-0 flex items-center justify-center h-4">
                  {isUnread && <span className="wf-notification-dot leading-none">●</span>}
                </div>
                <div className="wf-notification-item-body flex flex-col gap-0.5">
                  <span className="wf-notification-text">{item.text}</span>
                  {item.meta && <span className="wf-notification-meta">{item.meta}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
