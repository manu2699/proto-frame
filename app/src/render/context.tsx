// Render context: the interaction actions the recursive node renderers need,
// provided by the App container. Keeping this an interface (not a concrete
// import) is what lets the renderers stay presentational.

import { createContext, useContext, type ReactNode } from "react";

export interface WFActions {
  mode: () => "comment" | "prototype";
  drawMode: () => "sketch" | "clean";
  comment: (id: string, el: HTMLElement) => void;
  goto: (screenId: string) => void;
  openModal: (modalId: string) => void;
  pinOf: (id?: string) => number; // 1-based comment ordinal, or 0
}

const WFContext = createContext<WFActions | null>(null);

export function WFProvider(props: { value: WFActions; children: ReactNode }) {
  return <WFContext.Provider value={props.value}>{props.children}</WFContext.Provider>;
}

export const useWF = () => useContext(WFContext)!;

// Resolve what an element does when clicked, honoring the current mode.
export function handleClick(
  wf: WFActions,
  id: string | undefined,
  goto: string | undefined,
  opens: string | undefined,
  e: React.MouseEvent,
) {
  e.stopPropagation();
  if (wf.mode() === "prototype") {
    if (goto) return wf.goto(goto);
    if (opens) return wf.openModal(opens);
    // non-actionable in prototype mode: ignore
    return;
  }
  // comment mode: any commentable element opens a comment. Pass the element
  // (React nullifies the native event's currentTarget after dispatch).
  if (id) wf.comment(id, e.currentTarget as HTMLElement);
}
