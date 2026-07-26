// Raw escape hatch: render author-supplied HTML inside a commentable box.

import DOMPurify from "dompurify";
import type { WFNode } from "../types";
import { Pin } from "./Pin";
import { useWF, handleClick } from "./context";
import { modClasses } from "./util";

export function Raw(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  return (
    <div
      className={"wf-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(n.html || "") }} />
    </div>
  );
}
