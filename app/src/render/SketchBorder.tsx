// Renders a rough.js hand-drawn rectangle overlay that exactly fits the parent
// element. Only mounted when sketch mode is active (controlled by the caller).
// Also doubles as the "sub-element" primitive: works on any position:relative
// parent, not just .wf-box, so a second instance mounted inside an inner
// element gives it its own hand-drawn frame.

import { useEffect, useRef } from "react";
import { useWF } from "./context";
import rough from "roughjs";
import {
  BORDER_ROUGHNESS,
  DEFAULT_BOWING,
  DEFAULT_SKETCH_RADIUS_FALLBACK,
  DEFAULT_STROKE_WIDTH,
  drawEdgeAccent,
  drawRoughCircle,
  drawRoughRect,
  resolveStrokeAndFill,
} from "./sketch/roughDraw";

/** Call at the top of a kind component; returns <SketchBorder/> or null. */
export function useSketchBorder(opts?: Omit<Props, never>) {
  const wf = useWF();
  return wf.drawMode() === "sketch" ? <SketchBorder {...(opts ?? {})} /> : null;
}

interface Props {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  bowing?: number;
  fillStyle?: string;
  shape?: "rect" | "circle";
}

export function SketchBorder({
  fill,
  stroke,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  roughness = BORDER_ROUGHNESS,
  bowing = DEFAULT_BOWING,
  fillStyle = "solid",
  shape = "rect",
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  // rough.js "bowing" offsets scale with edge length, so long edges can wobble
  // several px past a stroke-width-only pad; without this headroom the
  // overshoot gets clipped by the SVG's own bounds, making long borders read
  // as randomly faint/broken per seed.
  const bleed = Math.max(6, bowing * 4);

  useEffect(() => {
    const svg = svgRef.current;
    const parent = svg?.parentElement;
    if (!svg || !parent) return;

    let prevW = 0;
    let prevH = 0;
    let raf = 0;

    const redraw = () => {
      raf = 0;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      if (!w || !h) return;
      if (w === prevW && h === prevH) return;
      prevW = w;
      prevH = h;

      svg.setAttribute("width", String(w + bleed * 2));
      svg.setAttribute("height", String(h + bleed * 2));
      svg.setAttribute("viewBox", `0 0 ${w + bleed * 2} ${h + bleed * 2}`);

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const { stroke: resolvedStroke, fill: resolvedFill } = resolveStrokeAndFill(parent, fill, stroke);

      const rc = rough.svg(svg);
      const pad = strokeWidth / 2 + 0.5;
      const drawOpts = {
        roughness,
        bowing,
        stroke: resolvedStroke,
        strokeWidth,
        fill: resolvedFill,
        fillStyle,
        seed: Math.floor(w * 3 + h * 7),
        // Single stroke pass per edge, vertices pinned to the true corners —
        // rough.js's default double-pass (two independent jittered strokes
        // per edge) is what reads as "hooks" poking out past each corner.
        disableMultiStroke: true,
        preserveVertices: true,
      };

      let node;
      if (shape === "circle") {
        const diameter = Math.min(w, h) - pad * 2;
        node = drawRoughCircle(rc, w / 2 + bleed, h / 2 + bleed, diameter, drawOpts);
      } else {
        const parentRadius = parseFloat(getComputedStyle(parent).borderRadius) || DEFAULT_SKETCH_RADIUS_FALLBACK;
        const innerW = w - pad * 2;
        const innerH = h - pad * 2;
        const radius = Math.max(0, parentRadius - pad);
        node = document.createElementNS("http://www.w3.org/2000/svg", "g");
        node.appendChild(drawRoughRect(rc, innerW, innerH, radius, drawOpts));
        node.appendChild(drawEdgeAccent(rc, innerW, innerH, radius, drawOpts.seed, drawOpts));
        node.setAttribute("transform", `translate(${pad + bleed}, ${pad + bleed})`);
      }
      svg.appendChild(node);
    };

    const scheduleRedraw = () => {
      if (!raf) raf = requestAnimationFrame(redraw);
    };

    redraw();
    const ro = new ResizeObserver(scheduleRedraw);
    ro.observe(parent);
    const forceRedraw = () => { prevW = 0; prevH = 0; scheduleRedraw(); };
    const mo = new MutationObserver(forceRedraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { ro.disconnect(); mo.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [fill, stroke, strokeWidth, roughness, bowing, fillStyle, shape]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="wf-sketch-border"
      style={{
        position: "absolute",
        top: -bleed,
        left: -bleed,
        right: -bleed,
        bottom: -bleed,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: -1,
      }}
    />
  );
}
