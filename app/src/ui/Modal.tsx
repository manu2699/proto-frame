// Modal overlay → shadcn Dialog (focus-trap + a11y). Renders an open modal's
// node tree; closes on overlay click, the × button, or Escape (handled by Radix).

import type { WFModal } from "../types";
import { Node, WFProvider, type WFActions } from "../render/Node";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { SketchBorder } from "../render/SketchBorder";

export function Modal(props: {
  modal?: WFModal;
  onClose: () => void;
  actions: WFActions;
}) {
  const md = props.modal;
  const isSketch = props.actions.drawMode() === "sketch";
  return (
    <Dialog open={!!md} onOpenChange={(o) => !o && props.onClose()}>
      {md && (
        <DialogContent aria-label={md.name} className="relative">
          {isSketch && <SketchBorder />}
          <DialogHeader>
            <DialogTitle>{md.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto px-4 py-5">
            <WFProvider value={props.actions}>
              {md.nodes.map((n, i) => <Node key={i} node={n} />)}
            </WFProvider>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
