import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";
import { DEFAULT_STROKE_WIDTH, LINE_BOWING, LINE_ROUGHNESS, drawRoughLine, resolveStrokeAndFill } from "../../sketch/roughDraw";
import rough from "roughjs";

function SketchTableLines({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
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
      const rc = rough.svg(svg);

      const rows = Array.from(container.children).filter(
        (el) => (el as HTMLElement).tagName.toUpperCase() !== "SVG"
      ) as HTMLElement[];

      // horizontal lines between rows (offsetTop relative to position:relative container).
      // Header/body divider (index 0) gets a heavier stroke now that .wf-th's own
      // background is stripped, for visual differentiation from row dividers.
      rows.slice(1).forEach((row, idx) => {
        const isHeaderDivider = idx === 0;
        svg.appendChild(
          drawRoughLine(rc, 0, row.offsetTop, w, row.offsetTop, {
            roughness: LINE_ROUGHNESS,
            bowing: LINE_BOWING,
            stroke,
            strokeWidth: isHeaderDivider ? DEFAULT_STROKE_WIDTH * 1.5 : DEFAULT_STROKE_WIDTH,
            seed: Math.floor(row.offsetTop * 5 + idx * 13),
          }),
        );
      });

      // vertical lines between columns (offsetLeft of header cells relative to container)
      if (rows.length > 0) {
        const cells = Array.from(rows[0].children) as HTMLElement[];
        cells.slice(1).forEach((cell, idx) => {
          svg.appendChild(
            drawRoughLine(rc, cell.offsetLeft, 0, cell.offsetLeft, h, {
              roughness: LINE_ROUGHNESS,
              bowing: LINE_BOWING,
              stroke,
              strokeWidth: DEFAULT_STROKE_WIDTH,
              seed: Math.floor(cell.offsetLeft * 5 + idx * 13),
            }),
          );
        });
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 1 }}
    />
  );
}

export function TableBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const tableContentRef = useRef<HTMLDivElement>(null);
  const isSketch = wf.drawMode() === "sketch";

  const headers = n.headers || [];
  const rows = n.rows || [];
  const hasActions = n.actions && n.actions.length > 0;

  let colCount = headers.length;
  if (n.selectable) colCount += 1;
  if (hasActions) colCount += 1;

  const rowBorder = isSketch ? "" : "border-t border-[var(--wf-c-line)] first:border-t-0";
  const cellBorder = isSketch ? "" : "border-l border-[var(--wf-c-line)] first:border-l-0";

  const box = (
    <div
      className={"wf-box block w-full p-0 min-h-0 text-left overflow-visible " + modClasses(n)}
      style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div ref={tableContentRef} className="wf-table-content w-full flex flex-col relative">
        {isSketch && <SketchTableLines containerRef={tableContentRef} />}
        <div
          className={"grid " + rowBorder}
          style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
        >
          {n.selectable && <div className={"wf-th wf-table-checkbox-col w-8 text-center justify-center shrink-0 flex items-center py-2 px-2.5 min-w-0 " + cellBorder}>☐</div>}
          {headers.map((h, i) => (
            <div
              key={i}
              className={"wf-th py-2 px-2.5 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis " + cellBorder}
            >
              {h}
            </div>
          ))}
          {hasActions && <div className={"wf-th wf-table-actions-col justify-end flex items-center text-right py-2 px-2.5 min-w-0 " + cellBorder}>Actions</div>}
        </div>
        {rows.map((row, ri) => (
          <div
            key={ri}
            className={"grid " + rowBorder}
            style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
          >
            {n.selectable && <div className={"wf-td wf-table-checkbox-col w-8 text-center justify-center shrink-0 flex items-center py-2 px-2.5 min-w-0 " + cellBorder}>☐</div>}
            {row.map((cell, ci) => (
              <div
                key={ci}
                className={"wf-td py-2 px-2.5 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis " + cellBorder}
              >
                {cell}
              </div>
            ))}
            {hasActions && (
              <div className={"wf-td wf-table-actions-col justify-end flex items-center text-right py-2 px-2.5 min-w-0 " + cellBorder}>
                <div className="wf-table-actions-container flex gap-1.5 justify-end">
                  {n.actions?.map((act, ai) => (
                    <span key={ai} className="wf-table-action-btn ml-1.5">
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
