// Global keyboard shortcuts, Figma-style: quick toggles for the review panel,
// the comment/prototype mode, and the theme. Ignored while typing into an
// input/textarea so they never swallow real keystrokes.

import { useEffect } from "react";

export interface ShortcutHandlers {
  togglePanel: () => void;
  setComment: () => void;
  setPrototype: () => void;
  toggleTheme: () => void;
  toggleSketch: () => void;
}

// Single source of truth for the bindings, reused by the on-screen cheat sheet.
export const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "C", label: "Comment mode" },
  { keys: "P", label: "Prototype" },
  { keys: "S", label: "Sketch mode" },
  { keys: "\\", label: "Toggle panel" },
];

function typingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function useShortcuts(h: ShortcutHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typingTarget(e.target) || e.altKey) return;

      // Cmd/Ctrl + . or \ → toggle the review panel (Figma's "hide UI").
      if ((e.metaKey || e.ctrlKey) && (e.key === "." || e.key === "\\")) {
        e.preventDefault();
        h.togglePanel();
        return;
      }
      if (e.metaKey || e.ctrlKey) return; // leave other combos to the browser

      switch (e.key.toLowerCase()) {
        case "c": h.setComment(); break;
        case "p": h.setPrototype(); break;
        case "s": h.toggleSketch(); break;
        case "\\": h.togglePanel(); break;
        case "d": h.toggleTheme(); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [h.togglePanel, h.setComment, h.setPrototype, h.toggleTheme, h.toggleSketch]);
}
