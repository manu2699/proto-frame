// App header: brand mark + feature name, screen tabs, theme + flow controls.
// Mode toggles moved into the floating ReviewSidebar panel / tweaks popover.

import type { ReactNode } from "react";
import type { WFFlow, WFModal, WFScreen, WFModel } from "../types";
import { ScreenTabs } from "./ScreenTabs";
import {
  Moon, Sun, PanelRightClose, PanelRightOpen, Sliders, Info,
  MousePointer, MessageSquare, Square, Pencil, Keyboard,
  Server, Component, Sparkle
} from "../components/ui/icons";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { Mode, DrawMode } from "../hooks/useNav";
import { SHORTCUTS } from "../hooks/useShortcuts";
import { cn } from "../lib/utils";

function BrandMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 text-primary" aria-hidden>
      <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5.5" y1="1" x2="5.5" y2="14" stroke="currentColor" strokeWidth="1" />
      <line x1="1" y1="5.5" x2="14" y2="5.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ModeGroup(props: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[58px] shrink-0 text-[10px] font-medium text-muted-foreground">{props.label}</span>
      <div className="flex flex-1 items-center rounded-md border border-input bg-background p-0.5 gap-0.5">
        {props.children}
      </div>
    </div>
  );
}

function ModeBtn(props: { active: boolean; onClick: () => void; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1 text-[11.5px] font-medium transition-colors cursor-pointer",
        props.active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {props.icon}
      {props.children}
    </button>
  );
}

function MetaRow(props: { label: string; value: string }) {
  return (
    <div className="my-0.5 flex gap-1.5 text-[11.5px] leading-normal text-muted-foreground">
      <span className="shrink-0 font-medium">{props.label}</span>
      <span className="truncate text-foreground/80">{props.value}</span>
    </div>
  );
}

function KeyItem(props: { color: string; icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <span className="inline-flex shrink-0 items-center" style={{ color: props.color }}>{props.icon}</span>
      {props.label}
    </span>
  );
}

export function Header(props: {
  feature: string;
  screens: WFScreen[];
  modals?: WFModal[];
  screenId: string;
  badgeCount: (screenName: string) => number;
  onGoto: (id: string) => void;
  theme: "light" | "dark";
  onTheme: () => void;
  flows?: WFFlow[];
  showFlow?: boolean;
  onToggleFlow?: () => void;
  reviewCollapsed: boolean;
  onToggleCollapse: () => void;
  mode: Mode;
  onMode: (m: Mode) => void;
  drawMode: DrawMode;
  onDrawMode: (d: DrawMode) => void;
  model: WFModel;
}) {
  return (
    <header className="z-10 flex h-11 shrink-0 items-stretch border-b border-border bg-card">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2.5 border-r border-dashed border-border px-4">
        <BrandMark />
        <div className="flex justify-center leading-none gap-3 items-center">
          <span
            className="text-[18px] font-semibold leading-none text-foreground"
            style={{ fontFamily: "'Patrick Hand', sans-serif", letterSpacing: "0.03em" }}
          >
            proto-frames
          </span>
          <span className="w-1 h-5 border-r border-gray-300" />
          <div className="flex items-center gap-1.5">
            <span className="max-w-[180px] truncate text-[12px]">{props.feature}</span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Feature Info"
                  title="Feature Info"
                  className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <Info className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 flex flex-col gap-3 p-4 z-[1200]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Metadata</span>
                {props.model.change && <MetaRow label="Change" value={props.model.change} />}
                <MetaRow label="Screens" value={props.model.screens.map((s) => s.name).join(", ")} />
                {props.model.designSource && <MetaRow label="Design" value={props.model.designSource} />}
                <div className="mt-1 flex flex-wrap gap-2.5 border-t border-dashed border-border pt-2.5">
                  <KeyItem color="var(--wf-tag-be, #1d4ed8)" icon={<Server className="h-3 w-3" />} label="endpoint" />
                  <KeyItem color="var(--wf-tag-ds, #047857)" icon={<Component className="h-3 w-3" />} label="design system" />
                  <KeyItem color="var(--wf-tag-guess)" icon={<Sparkle className="h-3 w-3" />} label="guessed" />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Screen tabs — fills remaining space */}
      <ScreenTabs
        screens={props.screens}
        modals={props.modals}
        screenId={props.screenId}
        badgeCount={props.badgeCount}
        onGoto={props.onGoto}
      />

      {/* Right controls: tweaks popover + theme + collapse toggle */}
      <div className="flex shrink-0 items-center gap-1 border-l border-border px-2">
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  aria-label="Tweaks & Settings"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <Sliders className="size-4" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Modes &amp; shortcuts</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" className="w-80 flex flex-col gap-4 p-4 z-[1200]">
            {/* Mode controls */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Modes</span>
              <ModeGroup label="Interaction">
                <ModeBtn
                  active={props.mode === "prototype"}
                  onClick={() => props.onMode("prototype")}
                  icon={<MousePointer className="h-3 w-3" />}
                  title="Prototype  (P)"
                >
                  Prototype
                </ModeBtn>
                <ModeBtn
                  active={props.mode === "comment"}
                  onClick={() => props.onMode("comment")}
                  icon={<MessageSquare className="h-3 w-3" />}
                  title="Comment  (C)"
                >
                  Comment
                </ModeBtn>
              </ModeGroup>
              <ModeGroup label="Style">
                <ModeBtn
                  active={props.drawMode === "clean"}
                  onClick={() => props.onDrawMode("clean")}
                  icon={<Square className="h-3 w-3" />}
                  title="Clean mode"
                >
                  Clean
                </ModeBtn>
                <ModeBtn
                  active={props.drawMode === "sketch"}
                  onClick={() => props.onDrawMode("sketch")}
                  icon={<Pencil className="h-3 w-3" />}
                  title="Sketch mode  (S)"
                >
                  Sketch
                </ModeBtn>
              </ModeGroup>
            </div>

            {/* Shortcuts */}
            <div className="border-t border-dashed border-border pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Keyboard className="h-3.5 w-3.5" /> Shortcuts
              </div>
              <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1.5 p-0">
                {SHORTCUTS.map((s) => (
                  <li key={s.keys} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-foreground">
                      {s.keys}
                    </kbd>
                    <span className="truncate">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={props.onTheme}
              aria-label="Toggle theme"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              {props.theme === "dark"
                ? <Sun className="size-4" />
                : <Moon className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} <kbd className="ml-1 rounded border border-foreground/20 bg-foreground/10 px-1 font-mono text-[10px]">D</kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={props.onToggleCollapse}
              aria-label={props.reviewCollapsed ? "Expand review panel" : "Collapse review panel"}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              {props.reviewCollapsed ? (
                <PanelRightOpen className="size-4" />
              ) : (
                <PanelRightClose className="size-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {props.reviewCollapsed ? "Show" : "Hide"} review panel <kbd className="ml-1 rounded border border-foreground/20 bg-foreground/10 px-1 font-mono text-[10px]">\</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
