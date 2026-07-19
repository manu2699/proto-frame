import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";
import { useSketchLine } from "../../sketch/SketchLine";

export function ChatWindowBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const headerLine = useSketchLine({ edge: "bottom" });
  const footerLine = useSketchLine({ edge: "top" });
  const isSketch = wf.drawMode() === "sketch";

  const messages = n.messages || [];

  const box = (
    <div
      className={"wf-box wf-chat-window-box flex flex-col items-stretch justify-start p-3 w-full min-h-[200px] " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-chat-content flex flex-col gap-2.5 w-full h-full">
        <div className="wf-chat-header border-b border-[var(--wf-c-line)] pb-1.5 relative">
          {headerLine}
          <span className="wf-chat-title">{n.label || "Chat Dialogue"}</span>
        </div>
        <div className="wf-chat-messages flex flex-col gap-2 flex-1 overflow-y-auto max-h-[200px] pr-1">
          {messages.map((msg, i) => {
            const isSent = !!msg.sent;
            return (
              <div
                key={i}
                className={"wf-chat-bubble-container flex w-full" + (isSent ? " wf-chat-bubble-sent justify-end" : " wf-chat-bubble-received justify-start")}
              >
                <div className="wf-chat-bubble max-w-[80%] flex flex-col gap-0.5 py-1.5 px-2.5 rounded-[var(--wf-radius)] relative">
                  {isSketch && <SketchBorder />}
                  <div className="wf-chat-bubble-sender mb-0.5">{msg.from}</div>
                  <div className="wf-chat-bubble-text leading-[1.35]">{msg.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="wf-chat-footer flex items-center border-t border-[var(--wf-c-line)] pt-2 gap-2 relative">
          {footerLine}
          <span className="wf-chat-input-placeholder flex-1 h-7 border border-[var(--wf-line)] rounded-[var(--wf-radius)] px-2 inline-flex items-center relative">
            {isSketch && <SketchBorder />}
            Type a message...
          </span>
          <span className="wf-chat-send-btn border border-[var(--wf-line)] rounded-[var(--wf-radius)] py-1 px-2.5">Send</span>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
