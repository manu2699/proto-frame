// Floating review panel: anchored to the right edge, overlays the canvas.
// Houses comment list and feedback actions.

import { Check, MessageSquare, X } from "../components/ui/icons";
import type { Comment } from "../types";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";

export function ReviewSidebar(props: {
  comments: Record<string, Comment>;
  order: string[];
  connected: boolean;
  collapsed: boolean;
  onFeedback: () => void;
  onApprove: () => void;
  onDelete: (id: string) => void;
}) {
  const ids = props.order.filter((id) => props.comments[id]);

  if (props.collapsed) {
    return null;
  }

  return (
    <aside className="flex w-[272px] shrink-0 flex-col overflow-hidden border-l border-dashed border-border bg-card">
      {/* Comments header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[12px] font-semibold text-foreground">Comments</span>
        {ids.length > 0 && (
          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-wfc-accent px-1.5 text-[10.5px] font-bold text-white">
            {ids.length}
          </span>
        )}
      </div>

      {/* Scrollable comment list */}
      <div className="min-h-0 flex-1 overflow-auto">
        {ids.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
            <p className="m-0 text-[11.5px] leading-relaxed text-muted-foreground">
              Switch to <strong>Comment</strong> mode and click any element to annotate it.
            </p>
          </div>
        ) : (
          <ol className="m-0 list-none p-0">
            {ids.map((id, i) => {
              const c = props.comments[id];
              return (
                <li key={id} className="group border-b border-border px-4 py-3 transition-colors hover:bg-muted/40">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wfc-accent-2 text-[9.5px] font-bold text-wfc-approve-foreground">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-[12px] font-semibold leading-snug text-foreground">{c.label}</span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {c.screen}{c.state ? ` / ${c.state}` : ""}
                      </span>
                    </span>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => props.onDelete(id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1.5 pl-7 break-words text-[11.5px] leading-snug text-muted-foreground">
                    {c.text}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Sticky footer */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-border px-4 py-3">
        <div className="flex items-center justify-end min-h-[14px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`inline-flex cursor-default items-center gap-1 text-[10px] ${props.connected ? "text-emerald-600" : "text-amber-500"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${props.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                {props.connected ? "Live" : "Disconnected"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">
              {props.connected
                ? "Connected to the MCP server — feedback streams directly to the agent."
                : "MCP server not reachable. Feedback and approvals will be copied to the clipboard instead."}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="flex-1" onClick={props.onFeedback}>
                Send feedback
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {props.connected
                ? "Send all comments to the agent as a structured feedback block."
                : "Copy a structured feedback block to the clipboard (agent offline)."}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="approve" className="flex-1" onClick={props.onApprove}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Approve this prototype to confirm screens and backend mapping are correct.
              The agent will produce an implementation plan and wait for your approval before building.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
