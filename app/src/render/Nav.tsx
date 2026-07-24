// Information-architecture nav: enumerated, grouped nav items (left rail or top
// bar). Each item is individually commentable and can drive flow.

import type { NavItem, WFNode } from "../types";
import { Pin } from "./Pin";
import { FlowTag } from "./FlowTag";
import { useWF, handleClick } from "./context";
import { withAnnotation } from "./Box";
import { SketchBorder } from "./SketchBorder";

export function Nav(props: { node: WFNode }) {
  const wf = useWF();
  const sketch = wf.drawMode() === "sketch";
  const isTop = props.node.side === "top";

  const navCls = isTop
    ? "wf-ia-nav flex flex-row gap-2 items-center flex-wrap overflow-hidden"
    : "wf-ia-nav flex flex-col gap-3.5 w-[260px] shrink-0 self-start overflow-y-auto max-h-[100cqh] overflow-hidden";

  return (
    <nav className={navCls}>
      {props.node.groups?.map((g, gi) => (
        <div
          key={gi}
          className={
            isTop ? "flex flex-row items-center gap-1.5" : "flex flex-col gap-1"
          }
        >
          {g.label && (
            <div className="wf-nav-group-label pt-0.5 px-0.5 pb-0">
              {g.label}
            </div>
          )}
          {g.items.map((it: NavItem & { _id?: string }, ii) => {
            const item = (
              <div
                className={`wf-box wf-nav-item flex items-center justify-start text-left min-h-0 py-1.5 px-2.5 gap-2 ${
                  it.active ? "wf-nav-active" : ""
                }`}
                data-wf-id={it._id}
                data-wf-commented={wf.pinOf(it._id) > 0 ? "1" : undefined}
                data-backend={it.backend}
                data-ds={it.ds}
                onClick={(e) => handleClick(wf, it._id, it.goto, it.opens, e)}
              >
                {sketch && (
                  <SketchBorder
                    strokeWidth={it.active ? 2.2 : 1.4}
                    roughness={1.4}
                  />
                )}
                <Pin id={it._id} />
                <span className="wf-nav-text flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {it.text}
                </span>
                {it.badge != null && (
                  <span className="wf-nav-badge px-1.5 leading-[1.5]">
                    {String(it.badge)}
                  </span>
                )}
                <FlowTag goto={it.goto} opens={it.opens} />
              </div>
            );
            return (
              <span key={ii} className="contents">
                {withAnnotation(item, it)}
              </span>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
