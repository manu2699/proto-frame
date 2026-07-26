// Pure helpers shared by every rough.js sketch-mode draw site: color
// resolution and shape geometry. No React here — components own the
// ResizeObserver / mount lifecycle and call into these on redraw.

import type { RoughSVG } from "roughjs/bin/svg";
import type { Options } from "roughjs/bin/core";

export const DEFAULT_ROUGHNESS = 1.125;
export const DEFAULT_BOWING = 0.9;
export const DEFAULT_STROKE_WIDTH = 1.125;
export const DEFAULT_SKETCH_RADIUS_FALLBACK = 8;

// Component borders (SketchBorder — outer .wf-box frame and inner rough
// boxes like fields/badges/bubbles) read as the "outline" of a shape, so
// they carry extra wobble. Divider lines inside a component (table rows/
// cols, header/footer separators) sit next to straight text and grid
// content, so they stay comparatively tame or the whole component reads
// messy.
export const BORDER_ROUGHNESS = DEFAULT_ROUGHNESS + 0.2;
export const LINE_ROUGHNESS = 0.7;
export const LINE_BOWING = 0.6;

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Stroke always tracks the element's own text color (--wf-ink, or an
 * explicit override) so sketch strokes never drift from body text color.
 * Fill falls back to the element's own resolved background, then --wf-bg.
 */
export function resolveStrokeAndFill(
  el: Element,
  fillOverride?: string,
  strokeOverride?: string,
): { stroke: string; fill: string } {
  const styles = getComputedStyle(el);
  const stroke = strokeOverride ?? styles.color;
  const ownBg = styles.backgroundColor;
  const hasOwnBg = ownBg && ownBg !== "rgba(0, 0, 0, 0)" && ownBg !== "transparent";
  const fill = fillOverride ?? (hasOwnBg ? ownBg : (styles.getPropertyValue("--wf-bg").trim() || "none"));
  return { stroke, fill };
}

/** Bezier-cornered rect path, `r` clamped so it never exceeds half a side. */
export function roundedRectPath(w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  if (rr < 0.5) {
    return `M0,0 H${w} V${h} H0 Z`;
  }
  return `M${rr},0 H${w - rr} Q${w},0 ${w},${rr} V${h - rr} Q${w},${h} ${w - rr},${h} H${rr} Q0,${h} 0,${h - rr} V${rr} Q0,0 ${rr},0 Z`;
}

/** Draws a (possibly rounded) rect at (0,0)–(w,h); caller positions via a wrapping <g>. */
export function drawRoughRect(rc: RoughSVG, w: number, h: number, r: number, opts: Options): SVGGElement {
  if (w <= 0 || h <= 0) {
    return document.createElementNS(SVG_NS, "g") as SVGGElement;
  }
  if (r > 0.5) {
    return rc.path(roundedRectPath(w, h, r), opts);
  }
  return rc.rectangle(0, 0, w, h, opts);
}

export function drawRoughCircle(rc: RoughSVG, cx: number, cy: number, diameter: number, opts: Options): SVGGElement {
  return rc.circle(cx, cy, diameter, opts);
}

/**
 * Re-inks one full straight edge of a (possibly rounded) `w`×`h` rect with a
 * second jittered pass — the natural "pencil went over this line twice"
 * look, confined to a single side instead of every edge (which is what
 * rough.js's own multi-stroke mode does, and reads as messy at corners).
 * `seed` picks which of the 4 edges so it's stable for a given box but
 * varies box-to-box.
 */
export function drawEdgeAccent(rc: RoughSVG, w: number, h: number, r: number, seed: number, opts: Options): SVGGElement {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const edges = [
    { x1: rr, y1: 0, x2: w - rr, y2: 0 }, // top
    { x1: w, y1: rr, x2: w, y2: h - rr }, // right
    { x1: w - rr, y1: h, x2: rr, y2: h }, // bottom
    { x1: 0, y1: h - rr, x2: 0, y2: rr }, // left
  ];
  const e = edges[((seed % 4) + 4) % 4];
  return rc.line(e.x1, e.y1, e.x2, e.y2, {
    ...opts,
    seed: seed + 53,
    roughness: (opts.roughness ?? DEFAULT_ROUGHNESS) * 1.3,
  });
}

/**
 * Two overlapping passes (base + offset seed/roughness) so a single line
 * reads as hand-drawn/double-stroked, matching the natural multi-pass look
 * rc.rectangle() already has on box edges.
 */
export function drawRoughLine(
  rc: RoughSVG,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: Options,
): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g") as SVGGElement;
  const seed = opts.seed ?? 1;
  g.appendChild(rc.line(x1, y1, x2, y2, opts));
  g.appendChild(
    rc.line(x1, y1, x2, y2, {
      ...opts,
      seed: seed + 97,
      roughness: (opts.roughness ?? DEFAULT_ROUGHNESS) * 1.3,
    }),
  );
  return g;
}
