// Presentational: the screen tab strip with per-screen comment-count badges.
// Modal tabs appear after a divider so users can navigate to modals directly
// (enabling comments on modal content without needing prototype mode).

import { Fragment, useRef, useState, useEffect } from "react";
import type { WFModal, WFScreen } from "../types";
import { cn } from "../lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";

function ChevronDown(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ScreenTabs(props: {
  screens: WFScreen[];
  modals?: WFModal[];
  screenId: string;
  badgeCount: (screenName: string) => number;
  onGoto: (id: string) => void;
}) {
  const modals = props.modals ?? [];
  const navRef = useRef<HTMLElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    // The "More" trigger is positioned absolutely (not a flex sibling), so it
    // never consumes nav's layout width — scrollWidth vs clientWidth here is
    // purely a function of the container/window size, with no feedback loop
    // where showing the button itself changes the measurement.
    const update = () => setHasOverflow(el.scrollWidth > el.clientWidth + 2);

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [props.screens.length, modals.length]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    // Redirect normal (vertical) wheel scrolling into horizontal scroll —
    // this strip has no vertical content, so a plain mouse wheel/trackpad
    // scroll should move through tabs instead of doing nothing. Only takes
    // over when there's actually somewhere to scroll, and only when the
    // gesture is vertical-dominant, so trackpad horizontal swipes still pass
    // through untouched.
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const goto = (id: string) => {
    setMoreOpen(false);
    props.onGoto(id);
  };

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

      {/* "More" menu: floats over the tab strip (not a layout sibling) so its
          own presence never shrinks nav and skews the overflow measurement.
          Only rendered once tabs no longer fit; lists every screen/modal so
          overflowed items stay reachable without scrolling. */}
      {hasOverflow && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-stretch bg-gradient-to-l from-card from-60% to-transparent pl-6">
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="More screens"
                className={cn(
                  "pointer-events-auto flex shrink-0 items-center gap-0.5 self-stretch px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer",
                  moreOpen && "bg-muted text-foreground",
                )}
              >
                <span className="text-[11px] font-medium">More</span>
                <ChevronDown />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 flex flex-col gap-0.5 p-1.5 z-[1200]">
              {props.screens.map((s) => {
                const active = props.screenId === s.id;
                const count = props.badgeCount(s.name);
                return (
                  <button
                    key={s.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => goto(s.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-[12.5px] transition-colors cursor-pointer",
                      active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    {s.role && <span className="wf-role-badge">{s.role}</span>}
                    {count > 0 && (
                      <span className="inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-wfc-accent px-1 text-[9.5px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
              {modals.length > 0 && (
                <>
                  <div className="my-1 border-t border-dashed border-border" aria-hidden />
                  {modals.map((m) => {
                    const tabId = `modal:${m.id}`;
                    const active = props.screenId === tabId;
                    return (
                      <button
                        key={tabId}
                        role="tab"
                        aria-selected={active}
                        onClick={() => goto(tabId)}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-[12.5px] italic transition-colors cursor-pointer",
                          active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{m.name}</span>
                        <span className="text-[9.5px] not-italic text-muted-foreground">modal</span>
                      </button>
                    );
                  })}
                </>
              )}
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
