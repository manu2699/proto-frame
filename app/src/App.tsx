// Container: wires the model, navigation, comments, and review hooks together
// and hands data + callbacks to the presentational components. All dependencies
// (model, id metadata, storage, transport) are injected — the entry points
// (src/main.tsx for prod, app/dev/main.tsx for dev) construct the concrete ones.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Toaster, toast } from "sonner";

import type { WFModel } from "./types";
import type { IdMeta } from "./model/stamp";
import type { Storage } from "./ports/storage";
import type { Transport } from "./ports/transport";
import { useNav } from "./hooks/useNav";
import { useComments } from "./hooks/useComments";
import { useReview } from "./hooks/useReview";
import { useTheme } from "./hooks/useTheme";
import { useShortcuts } from "./hooks/useShortcuts";
import type { WFActions } from "./render/Node";
import { Header } from "./ui/Header";
import { Canvas } from "./ui/Canvas";
import { ReviewSidebar } from "./ui/ReviewSidebar";
import { Modal } from "./ui/Modal";
import { ModalPreview } from "./ui/ModalPreview";
import { CommentPopover } from "./ui/CommentPopover";
import { FlowMap } from "./ui/FlowMap";
import { TooltipProvider } from "./components/ui/tooltip";

const REVIEW_COLLAPSE_KEY = "wfc:review-collapsed";

function readReviewCollapsed(): boolean {
  try {
    return localStorage.getItem(REVIEW_COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function App(props: {
  model: WFModel;
  meta: Map<string, IdMeta>;
  storage: Storage;
  transport: Transport;
}) {
  const { model, meta, storage, transport } = props;
  const metaOf = (id: string) => meta.get(id);

  const { nav, gotoScreen, setState, openModal, closeModal, setMode, setDrawMode } = useNav(model);
  const { comments, order, upsert, remove } = useComments(storage);
  const { theme, toggle: toggleTheme } = useTheme();

  // Connection-state toasts
  const everConnected = useRef(false);
  const disconnectToastId = useRef<string | number | null>(null);

  const flash = useCallback((msg: string) => {
    if (msg.includes("Queued")) {
      toast.warning("Queued for agent", { description: "Will deliver when agent reconnects.", duration: 3000 });
    } else if (msg.includes("clipboard")) {
      toast.info("Copied to clipboard", { duration: 2000 });
    } else {
      toast.success("Sent to agent", { duration: 2000 });
    }
  }, []);

  const review = useReview({ model, metaOf, comments, order, upsert, remove, transport, flash });

  const [reviewCollapsed, setReviewCollapsed] = useState(readReviewCollapsed);
  const [showFlow, setShowFlow] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(REVIEW_COLLAPSE_KEY, reviewCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [reviewCollapsed]);

  const togglePanel = useCallback(() => setReviewCollapsed((c) => !c), []);
  const setComment = useCallback(() => setMode("comment"), [setMode]);
  const setPrototype = useCallback(() => setMode("prototype"), [setMode]);
  const toggleSketch = useCallback(
    () => setDrawMode(nav.drawMode === "sketch" ? "clean" : "sketch"),
    [setDrawMode, nav.drawMode],
  );
  useShortcuts({ togglePanel, setComment, setPrototype, toggleTheme, toggleSketch });

  useEffect(() => {
    document.documentElement.setAttribute("data-drawmode", nav.drawMode);
  }, [nav.drawMode]);

  const connected = useSyncExternalStore(transport.subscribe, transport.isConnected);

  useEffect(() => {
    if (connected) {
      if (!everConnected.current) {
        everConnected.current = true;
        toast.success("Agent connected", { duration: 2000 });
      } else {
        if (disconnectToastId.current) {
          toast.dismiss(disconnectToastId.current);
          disconnectToastId.current = null;
        }
        toast.success("Agent reconnected", { duration: 2500 });
      }
    } else if (everConnected.current) {
      disconnectToastId.current = toast.warning("Agent disconnected", {
        description: "Reconnecting automatically. Feedback will be queued.",
        duration: Infinity,
        action: {
          label: "Copy URL",
          onClick: () => navigator.clipboard?.writeText(window.location.href),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const pinOf = (id?: string) => (id ? order.indexOf(id) + 1 : 0);

  const activeScreen = useMemo(
    () => model.screens.find((s) => s.id === nav.screenId),
    [model, nav.screenId],
  );
  const activeState = useMemo(() => {
    if (!activeScreen) return undefined;
    return (activeScreen.states ?? []).find((st) => st.id === nav.stateByScreen[activeScreen.id])
      || (activeScreen.states ?? [])[0];
  }, [activeScreen, nav.stateByScreen]);
  const activeModal = useMemo(
    () => (model.modals || []).find((m) => m.id === nav.modalId),
    [model, nav.modalId],
  );
  // Modal tab selected: screenId == "modal:<id>" → show inline preview
  const activeModalPreview = useMemo(() => {
    if (!nav.screenId?.startsWith("modal:")) return undefined;
    const id = nav.screenId.slice(6);
    return (model.modals || []).find((m) => m.id === id);
  }, [model, nav.screenId]);

  const badgeCount = (screenName: string) =>
    order.filter((id) => comments[id] && metaOf(id)?.screen === screenName).length;

  const actions: WFActions = {
    mode: () => nav.mode,
    drawMode: () => nav.drawMode,
    comment: review.openComment,
    goto: gotoScreen,
    openModal,
    pinOf,
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="wf-app flex h-screen flex-col" data-mode={nav.mode} data-drawmode={nav.drawMode}>
        <Header
          feature={model.feature} screens={model.screens} modals={model.modals} screenId={nav.screenId}
          badgeCount={badgeCount} onGoto={gotoScreen}
          theme={theme} onTheme={toggleTheme}
          flows={model.flows} showFlow={showFlow} onToggleFlow={() => setShowFlow((v) => !v)}
          reviewCollapsed={reviewCollapsed} onToggleCollapse={togglePanel}
          mode={nav.mode} onMode={setMode}
          drawMode={nav.drawMode} onDrawMode={setDrawMode}
          model={model}
        />
        {showFlow && model.flows && model.flows.length > 0 && (
          <FlowMap flows={model.flows} onGoto={gotoScreen} />
        )}

        <div className="flex min-h-0 flex-1">
          {activeModalPreview
            ? <ModalPreview modal={activeModalPreview} actions={actions} />
            : <Canvas screen={activeScreen} state={activeState} onSetState={setState} actions={actions} />}
          <ReviewSidebar
            comments={comments} order={order}
            connected={connected}
            onFeedback={review.onFeedback} onApprove={review.onApprove} onDelete={remove}
            collapsed={reviewCollapsed}
          />
        </div>

        <Modal modal={activeModal} onClose={closeModal} actions={actions} />

        {review.popover && (
          <CommentPopover
            state={review.popover}
            onClose={review.closeComment}
            onSave={review.saveComment}
            onDelete={() => review.deleteComment(review.popover!.id)}
          />
        )}

        <Toaster
          position="bottom-left"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0d0d0d",
              border: "1px solid #222",
              color: "#ebebeb",
              fontFamily: "inherit",
              fontSize: "12.5px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
            },
          }}
          style={{
            "--success-bg": "#0d0d0d",
            "--success-border": "#10b981",
            "--success-text": "#ebebeb",
            "--warning-bg": "#0d0d0d",
            "--warning-border": "#f59e0b",
            "--warning-text": "#ebebeb",
            "--info-bg": "#0d0d0d",
            "--info-border": "#6366f1",
            "--info-text": "#ebebeb",
            "--error-bg": "#0d0d0d",
            "--error-border": "#ef4444",
            "--error-text": "#ebebeb",
          } as React.CSSProperties}
        />
      </div>
    </TooltipProvider>
  );
}
