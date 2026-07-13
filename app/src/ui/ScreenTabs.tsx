// Presentational: the screen tab strip with per-screen comment-count badges.
// Modal tabs appear after a divider so users can navigate to modals directly
// (enabling comments on modal content without needing prototype mode).

import { Fragment, useRef, useState, useEffect } from "react";
import type { WFModal, WFScreen } from "../types";
import { cn } from "../lib/utils";

export function ScreenTabs(props: {
  screens: WFScreen[];
  modals?: WFModal[];
  screenId: string;
  badgeCount: (screenName: string) => number;
  onGoto: (id: string) => void;
}) {
  const modals = props.modals ?? [];
  const navRef = useRef<HTMLElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const update = () => {
      // More tabs to the right when scrollWidth > clientWidth + scrollLeft (with 2px buffer)
      setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative min-w-0 flex-1">
    <nav ref={navRef} className="wf-screen-tabs flex h-full items-stretch overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
      {props.screens.map((s, i) => {
        const active = props.screenId === s.id;
        const count = props.badgeCount(s.name);
        return (
          <Fragment key={s.id}>
            {i > 0 && (
              <div className="my-auto mx-0.5 h-3.5 w-px shrink-0 bg-border opacity-60" aria-hidden />
            )}
            <button
              role="tab"
              aria-selected={active}
              onClick={() => props.onGoto(s.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-[12.5px] transition-colors",
                active
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.name}
              {s.role && <span className="wf-role-badge">{s.role}</span>}
              {count > 0 && (
                <span className="ml-1.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-wfc-accent px-1 text-[9.5px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </Fragment>
        );
      })}

      {modals.length > 0 && (
        <>
          <div className="mx-2 my-auto h-4 w-px shrink-0 bg-border" aria-hidden />
          {modals.map((m) => {
            const tabId = `modal:${m.id}`;
            const active = props.screenId === tabId;
            return (
              <button
                key={tabId}
                role="tab"
                aria-selected={active}
                onClick={() => props.onGoto(tabId)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 text-[12.5px] italic transition-colors",
                  active
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {m.name}
                <span className="text-[9.5px] not-italic text-muted-foreground">modal</span>
              </button>
            );
          })}
        </>
      )}
    </nav>
    {/* Fade overlay hints that more tabs are scrollable to the right */}
    {showRightFade && (
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent"
        aria-hidden
      />
    )}
    </div>
  );
}
