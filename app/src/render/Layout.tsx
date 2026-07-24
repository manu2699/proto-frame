// Layout containers: row / col / grid. These carry no id (not commentable) and
// just arrange their children. One component, registered under all three types.

import type { CSSProperties } from "react";
import type { WFNode } from "../types";
import { Node } from "./Node";
import { modClasses, layoutClasses } from "./util";

export function Layout(props: { node: WFNode }) {
  const n = props.node;
  const hasGapMod = n.mods?.some((m) => m === "compact" || m === "loose");
  
  if (n.type === "grid") {
    return (
      <div
        className={`grid ${hasGapMod ? "" : "gap-3"} ${layoutClasses(n)} ${modClasses(n)}`}
        style={{ gridTemplateColumns: `repeat(${n.cols ?? 3}, minmax(0, 1fr))` }}
      >
        {n.children?.map((c, i) => <Node key={i} node={c} />)}
      </div>
    );
  }
  if (n.type === "col") {
    return (
      <div
        className={`flex flex-col flex-1 ${hasGapMod ? "" : "gap-3"} ${layoutClasses(n)} ${modClasses(n)}`}
        style={n.flex !== undefined ? { flex: n.flex } : undefined}
      >
        {n.children?.map((c, i) => <Node key={i} node={c} />)}
      </div>
    );
  }
  const hasAlignMod = n.mods?.some((m) => m === "middle");
  return (
    <div
      className={`flex ${hasAlignMod ? "" : "items-center"} ${hasGapMod ? "" : "gap-3"} ${layoutClasses(n)} ${modClasses(n)}`}
    >
      {n.children?.map((c, i) => <Node key={i} node={c} />)}
    </div>
  );
}
