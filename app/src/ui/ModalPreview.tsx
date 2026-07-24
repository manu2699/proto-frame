// Inline modal preview for comment mode. Renders modal content as a centred
// card on the canvas background — no Dialog/focus-trap so comment clicks work.

import type { WFModal } from "../types";
import { Node, WFProvider, type WFActions } from "../render/Node";
import { SketchBorder } from "../render/SketchBorder";

export function ModalPreview(props: { modal: WFModal; actions: WFActions }) {
  const { modal, actions } = props;
  const isSketch = actions.drawMode() === "sketch";
  return (
    <div className="wf-canvas-dotgrid flex flex-1 items-start justify-center overflow-auto p-10">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl relative wf-modal-preview-card">
        {isSketch && <SketchBorder />}
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">{modal.name}</h2>
        </div>
        <div className="overflow-auto px-6 py-5">
          <WFProvider value={actions}>
            {modal.nodes.map((n, i) => <Node key={i} node={n} />)}
          </WFProvider>
        </div>
      </div>
    </div>
  );
}
