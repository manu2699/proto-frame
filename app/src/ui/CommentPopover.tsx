// Anchored comment popover — dark card style, Figma-inspired.
// Radix Popover with virtual element anchor for collision-aware positioning.

import { useEffect, useMemo, useRef, useState } from "react";
import type { PopoverState } from "../hooks/useReview";
import { Popover, PopoverAnchor, PopoverContent } from "../components/ui/popover";
import { Button } from "../components/ui/button";

export function CommentPopover(props: {
  state: PopoverState;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(props.state.text);
  const existing = !!props.state.text;
  const { rect } = props.state;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const virtualRef = useMemo(
    () => ({
      current: {
        getBoundingClientRect: () =>
          ({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
            toJSON() {},
          }) as DOMRect,
      },
    }),
    [rect.left, rect.top, rect.width, rect.height],
  );

  return (
    <Popover open onOpenChange={(o) => !o && props.onClose()}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent
        side="bottom"
        align="start"
        onClick={(e) => e.stopPropagation()}
        className="w-[280px] overflow-hidden rounded-xl border-0 bg-zinc-900 p-0 text-zinc-100 shadow-2xl"
      >
        {/* Header: element label + screen path */}
        <div className="border-b border-zinc-800 px-4 py-3">
          <div className="text-[11.5px] font-semibold text-zinc-100 truncate">{props.state.label}</div>
          <div className="text-[10.5px] text-zinc-500 mt-0.5">{props.state.screen}{props.state.state ? ` / ${props.state.state}` : ""}</div>
        </div>

        {/* Text input */}
        <div className="px-4 py-3">
          <textarea
            ref={textareaRef}
            autoFocus
            placeholder="What should change here?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const t = text.trim();
                if (!t) return props.onClose();
                props.onSave(t);
              }
            }}
            rows={1}
            style={{ minHeight: "36px", maxHeight: "120px" }}
            className="w-full resize-none overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-[12.5px] leading-snug text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-2.5">
          {existing && (
            <button
              type="button"
              onClick={props.onDelete}
              className="mr-auto text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={props.onClose}
            className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const t = text.trim();
              if (!t) return props.onClose();
              props.onSave(t);
            }}
            className="rounded-md bg-zinc-100 px-3 py-1 text-[11.5px] font-semibold text-zinc-900 transition-colors hover:bg-white"
          >
            Save
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
