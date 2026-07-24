import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses, layoutClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { SketchBorder, useSketchBorder } from "../../SketchBorder";
import {
  DEFAULT_STROKE_WIDTH,
  LINE_BOWING,
  LINE_ROUGHNESS,
  drawRoughLine,
  resolveStrokeAndFill,
} from "../../sketch/roughDraw";
import rough from "roughjs";

type GraphNode = { id: string; label: string; goto?: string; opens?: string };
type GraphEdge = { from: string; to: string; label?: string };

// Rank = longest-path depth from a root (a node that never appears as an
// edge's `to`). Iterative relax with a hard guard so a cyclic graph can't
// spin forever — anything still unranked after the guard gets dumped into
// the last rank rather than left off the diagram.
function computeRanks(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const validEdges = edges.filter((e) => idSet.has(e.from) && idSet.has(e.to));
  const targets = new Set(validEdges.map((e) => e.to));
  const roots = ids.filter((id) => !targets.has(id));
  const rootIds = roots.length > 0 ? roots : ids.slice(0, 1);

  const adj = new Map<string, string[]>();
  for (const e of validEdges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }

  const rank = new Map<string, number>();
  rootIds.forEach((id) => rank.set(id, 0));

  const queue: { id: string; depth: number }[] = rootIds.map((id) => ({ id, depth: 0 }));
  const maxGuard = ids.length * ids.length + ids.length + 10;
  let guard = 0;
  while (queue.length && guard < maxGuard) {
    guard++;
    const { id, depth } = queue.shift()!;
    for (const next of adj.get(id) ?? []) {
      const nd = depth + 1;
      const cur = rank.get(next);
      if (cur === undefined || nd > cur) {
        rank.set(next, nd);
        queue.push({ id: next, depth: nd });
      }
    }
  }

  const maxRank = Math.max(0, ...Array.from(rank.values()));
  for (const id of ids) {
    if (!rank.has(id)) rank.set(id, maxRank + 1);
  }
  return rank;
}

function appendArrowhead(svg: SVGSVGElement, x: number, y: number, angle: number, color: string) {
  const size = 6;
  const spread = 0.45;
  const p1x = x - size * Math.cos(angle - spread);
  const p1y = y - size * Math.sin(angle - spread);
  const p2x = x - size * Math.cos(angle + spread);
  const p2y = y - size * Math.sin(angle + spread);
  const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  poly.setAttribute("points", `${x},${y} ${p1x},${p1y} ${p2x},${p2y}`);
  poly.setAttribute("fill", color);
  svg.appendChild(poly);
}

// Edges are drawn in a separate absolutely-positioned SVG overlay measured
// off the rendered node DOM (mirrors SketchTableLines in TableBox.tsx) —
// straight line + arrowhead, sketch mode reuses drawRoughLine.
function FlowGraphEdges(props: {
  containerRef: RefObject<HTMLDivElement | null>;
  nodeRefs: RefObject<Map<string, HTMLDivElement>>;
  edges: GraphEdge[];
  direction: "TB" | "LR";
  sketch: boolean;
}) {
  const { containerRef, nodeRefs, edges, direction, sketch } = props;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const draw = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (!w || !h) return;

      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const { stroke } = resolveStrokeAndFill(container);
      const containerRect = container.getBoundingClientRect();
      const rc = sketch ? rough.svg(svg) : null;

      edges.forEach((edge, idx) => {
        const fromEl = nodeRefs.current?.get(edge.from);
        const toEl = nodeRefs.current?.get(edge.to);
        if (!fromEl || !toEl) return;
        const fr = fromEl.getBoundingClientRect();
        const tr = toEl.getBoundingClientRect();

        let x1: number, y1: number, x2: number, y2: number;
        if (direction === "LR") {
          x1 = fr.right - containerRect.left;
          y1 = fr.top + fr.height / 2 - containerRect.top;
          x2 = tr.left - containerRect.left;
          y2 = tr.top + tr.height / 2 - containerRect.top;
        } else {
          x1 = fr.left + fr.width / 2 - containerRect.left;
          y1 = fr.bottom - containerRect.top;
          x2 = tr.left + tr.width / 2 - containerRect.left;
          y2 = tr.top - containerRect.top;
        }

        if (sketch && rc) {
          svg.appendChild(
            drawRoughLine(rc, x1, y1, x2, y2, {
              roughness: LINE_ROUGHNESS,
              bowing: LINE_BOWING,
              stroke,
              strokeWidth: DEFAULT_STROKE_WIDTH,
              seed: Math.floor(x1 * 5 + y1 * 3 + idx * 13),
            }),
          );
        } else {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", String(x1));
          line.setAttribute("y1", String(y1));
          line.setAttribute("x2", String(x2));
          line.setAttribute("y2", String(y2));
          line.setAttribute("stroke", "var(--wf-c-line)");
          line.setAttribute("stroke-width", "1.5");
          svg.appendChild(line);
        }

        const angle = Math.atan2(y2 - y1, x2 - x1);
        appendArrowhead(svg, x2, y2, angle, sketch ? stroke : "var(--wf-c-line)");

        if (edge.label) {
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.setAttribute("x", String((x1 + x2) / 2));
          text.setAttribute("y", String((y1 + y2) / 2 - 4));
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-size", "8");
          text.setAttribute("fill", "var(--wf-muted)");
          text.setAttribute("font-family", "var(--wf-c-sans)");
          text.textContent = edge.label;
          svg.appendChild(text);

          // Backing rect behind the label so it stays legible over the line
          // (and over a neighbouring box) regardless of rank spacing.
          const bbox = text.getBBox();
          const pad = 2;
          const backing = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          backing.setAttribute("x", String(bbox.x - pad));
          backing.setAttribute("y", String(bbox.y - pad));
          backing.setAttribute("width", String(bbox.width + pad * 2));
          backing.setAttribute("height", String(bbox.height + pad * 2));
          backing.setAttribute("fill", "var(--wf-bg)");
          svg.insertBefore(backing, text);
        }
      });
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, nodeRefs, edges, direction, sketch]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 1 }}
    />
  );
}

export function FlowGraphBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const isSketch = wf.drawMode() === "sketch";
  const direction = n.direction ?? "TB";

  const graphNodes = n.graphNodes ?? [];
  const graphEdges = n.graphEdges ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const ranks = computeRanks(graphNodes, graphEdges);
  const rankGroups: GraphNode[][] = [];
  graphNodes.forEach((gn) => {
    const r = ranks.get(gn.id) ?? 0;
    if (!rankGroups[r]) rankGroups[r] = [];
    rankGroups[r].push(gn);
  });

  const box = (
    <div
      className={"wf-box wf-flowgraph-box " + layoutClasses(n) + " " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-chart-container flex flex-col w-full h-full gap-2 items-stretch">
        {n.label && <span className="wf-chart-label">{n.label}</span>}
        <div
          ref={containerRef}
          className={
            "wf-flowgraph-body relative flex gap-14 p-3 " +
            (direction === "LR" ? "flex-row items-center" : "flex-col items-center")
          }
        >
          <FlowGraphEdges
            containerRef={containerRef}
            nodeRefs={nodeRefs}
            edges={graphEdges}
            direction={direction}
            sketch={isSketch}
          />
          {rankGroups.map((rankNodes, ri) => (
            <div
              key={ri}
              className={
                "wf-flowgraph-rank flex gap-4 " +
                (direction === "LR"
                  ? "flex-col items-center"
                  : "flex-row items-center justify-center flex-wrap")
              }
            >
              {rankNodes.map((gn) => {
                const clickable = Boolean(gn.goto || gn.opens);
                return (
                  <div
                    key={gn.id}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(gn.id, el);
                      else nodeRefs.current.delete(gn.id);
                    }}
                    className={
                      "wf-flowgraph-node wf-box relative flex items-center justify-center text-center min-w-[90px] min-h-[40px] px-3 py-2 z-10 " +
                      (clickable ? "cursor-pointer" : "")
                    }
                    onClick={(e) => clickable && handleClick(wf, undefined, gn.goto, gn.opens, e)}
                  >
                    {isSketch && <SketchBorder roughness={1.4} strokeWidth={1.4} />}
                    <span className="wf-box-label">{gn.label}</span>
                    {clickable && <FlowTag goto={gn.goto} opens={gn.opens} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
