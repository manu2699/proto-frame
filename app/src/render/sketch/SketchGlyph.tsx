// Fixed-size rough.js glyphs replacing the Unicode ◉/○ and ☑/☐ indicators in
// sketch mode. Rendered at whatever pixel size the parent's own className
// gives them (1em, matching the text they sit next to) — no ResizeObserver
// needed since that size never changes after mount, only theme/color can,
// which the MutationObserver below still tracks.

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import rough from "roughjs";
import { DEFAULT_BOWING, DEFAULT_ROUGHNESS, DEFAULT_STROKE_WIDTH, drawRoughRect, resolveStrokeAndFill } from "./roughDraw";

const glyphStyle: CSSProperties = {
  display: "inline-block",
  width: "1em",
  height: "1em",
  verticalAlign: "middle",
  overflow: "visible",
};

function useThemeRedraw(draw: () => void, deps: unknown[]) {
  useEffect(() => {
    draw();
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function SketchRadio({ selected }: { selected: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useThemeRedraw(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const w = svg.clientWidth || 14;
    const h = svg.clientHeight || 14;
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const { stroke } = resolveStrokeAndFill(svg.parentElement ?? svg);
    const rc = rough.svg(svg);
    const cx = w / 2;
    const cy = h / 2;
    const outerD = Math.min(w, h) - DEFAULT_STROKE_WIDTH - 1;

    svg.appendChild(
      rc.circle(cx, cy, outerD, {
        roughness: DEFAULT_ROUGHNESS,
        bowing: DEFAULT_BOWING,
        stroke,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        fill: "none",
        seed: 11,
      }),
    );
    if (selected) {
      svg.appendChild(
        rc.circle(cx, cy, outerD * 0.45, {
          roughness: DEFAULT_ROUGHNESS,
          stroke,
          strokeWidth: DEFAULT_STROKE_WIDTH,
          fill: stroke,
          fillStyle: "solid",
          seed: 23,
        }),
      );
    }
  }, [selected]);

  return <svg ref={svgRef} aria-hidden="true" className="wf-sketch-glyph wf-sketch-radio" style={glyphStyle} />;
}

export function SketchCheckbox({ checked }: { checked: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useThemeRedraw(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const w = svg.clientWidth || 14;
    const h = svg.clientHeight || 14;
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const { stroke } = resolveStrokeAndFill(svg.parentElement ?? svg);
    const rc = rough.svg(svg);
    const pad = DEFAULT_STROKE_WIDTH / 2 + 0.5;
    const boxOpts = {
      roughness: DEFAULT_ROUGHNESS,
      bowing: DEFAULT_BOWING,
      stroke,
      strokeWidth: DEFAULT_STROKE_WIDTH,
      fill: "none",
      seed: 17,
    };
    const box = drawRoughRect(rc, w - pad * 2, h - pad * 2, 1.5, boxOpts);
    box.setAttribute("transform", `translate(${pad}, ${pad})`);
    svg.appendChild(box);

    if (checked) {
      svg.appendChild(
        rc.linearPath(
          [
            [w * 0.22, h * 0.52],
            [w * 0.42, h * 0.72],
            [w * 0.8, h * 0.28],
          ],
          {
            roughness: DEFAULT_ROUGHNESS,
            stroke,
            strokeWidth: DEFAULT_STROKE_WIDTH + 0.3,
            seed: 29,
          },
        ),
      );
    }
  }, [checked]);

  return <svg ref={svgRef} aria-hidden="true" className="wf-sketch-glyph wf-sketch-checkbox" style={glyphStyle} />;
}
