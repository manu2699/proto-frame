// Single hand-drawn line flush with one edge of the parent element. Same
// ResizeObserver-on-parent pattern as SketchBorder; replaces every
// pseudo-element background-image divider from the old CSS mechanism.

import { useEffect, useRef } from "react";
import { useWF } from "../context";
import rough from "roughjs";
import { DEFAULT_STROKE_WIDTH, LINE_BOWING, LINE_ROUGHNESS, drawRoughLine, resolveStrokeAndFill } from "./roughDraw";

type Edge = "top" | "bottom" | "left" | "right";

interface Props {
  edge: Edge;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  bowing?: number;
}

/** Call at the top of a kind component; returns <SketchLine/> or null. */
export function useSketchLine(opts: Props) {
  const wf = useWF();
  return wf.drawMode() === "sketch" ? <SketchLine {...opts} /> : null;
}

export function SketchLine({
  edge,
  stroke,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  roughness = LINE_ROUGHNESS,
  bowing = LINE_BOWING,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

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

      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const { stroke: resolvedStroke } = resolveStrokeAndFill(parent, undefined, stroke);
      const rc = rough.svg(svg);
      const pad = strokeWidth / 2 + 0.5;
      const opts = {
        roughness,
        bowing,
        stroke: resolvedStroke,
        strokeWidth,
        seed: Math.floor(w * 3 + h * 7),
      };

      let line;
      switch (edge) {
        case "top": line = drawRoughLine(rc, 0, pad, w, pad, opts); break;
        case "bottom": line = drawRoughLine(rc, 0, h - pad, w, h - pad, opts); break;
        case "left": line = drawRoughLine(rc, pad, 0, pad, h, opts); break;
        case "right": line = drawRoughLine(rc, w - pad, 0, w - pad, h, opts); break;
      }
      svg.appendChild(line);
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
  }, [edge, stroke, strokeWidth, roughness, bowing]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="wf-sketch-line"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 0,
      }}
    />
  );
}
