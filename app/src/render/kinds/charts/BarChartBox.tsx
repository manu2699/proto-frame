import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses, layoutClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

// SVG-based bars (mirrors LineChartBox's approach) so sizing lives in a fixed
// viewBox coordinate space instead of a CSS percentage-height chain — the
// previous DOM/Tailwind version collapsed to zero height because none of its
// ancestors had a definite (non-auto) height for the percentages to resolve against.
export function BarChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const defaultData = [
    { label: "A", value: 40 },
    { label: "B", value: 75, target: 80 },
    { label: "C", value: 50 },
    { label: "D", value: 90, target: 85 },
    { label: "E", value: 60 },
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0)), 1);

  const svgWidth = 240;
  const svgHeight = 130;
  const paddingLeft = 26;
  const paddingRight = 10;
  const paddingTop = 12;
  const paddingBottom = 24;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + chartHeight;

  const slot = chartWidth / data.length;
  const barWidth = Math.min(22, slot * 0.44);
  const targetWidth = Math.min(12, slot * 0.22);

  // Faint horizontal gridlines at 25/50/75% for readability, monochrome only.
  const gridFractions = [0.25, 0.5, 0.75];

  const box = (
    <div
      className={"wf-box wf-barchart-box " + layoutClasses(n) + " " + modClasses(n)}
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
        <div className="wf-chart-body wf-barchart-body flex items-center justify-center min-h-[140px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="wf-barchart-svg w-full h-full max-h-[160px] overflow-visible">
            {gridFractions.map((f) => (
              <line
                key={f}
                x1={paddingLeft}
                y1={paddingTop + chartHeight * (1 - f)}
                x2={paddingLeft + chartWidth}
                y2={paddingTop + chartHeight * (1 - f)}
                className="wf-chart-grid-line"
                stroke="var(--wf-c-line)"
                strokeWidth="1"
              />
            ))}

            <line
              x1={paddingLeft}
              y1={baselineY}
              x2={paddingLeft + chartWidth}
              y2={baselineY}
              className="wf-chart-axis-line"
              stroke="var(--wf-line)"
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={baselineY}
              className="wf-chart-axis-line"
              stroke="var(--wf-line)"
              strokeWidth="1"
            />

            {data.map((d, i) => {
              const cx = paddingLeft + slot * (i + 0.5);
              const barH = (d.value / maxVal) * chartHeight;
              const hasTarget = d.target !== undefined;
              const targetH = hasTarget ? ((d.target ?? 0) / maxVal) * chartHeight : 0;
              const gap = hasTarget ? 3 : 0;
              const mainX = cx - (hasTarget ? (barWidth + gap) / 2 : barWidth / 2);
              const targetX = mainX + barWidth + gap;

              return (
                <g key={i} className="wf-chart-bar-group">
                  <rect
                    x={mainX}
                    y={baselineY - barH}
                    width={barWidth}
                    height={Math.max(barH, 1)}
                    rx="1.5"
                    className="wf-chart-bar-main"
                    fill="var(--wf-ink)"
                  >
                    <title>{`${d.label}: ${d.value}`}</title>
                  </rect>
                  {hasTarget && (
                    <rect
                      x={targetX}
                      y={baselineY - targetH}
                      width={targetWidth}
                      height={Math.max(targetH, 1)}
                      rx="1"
                      className="wf-chart-bar-target"
                      fill="none"
                      stroke="var(--wf-muted)"
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                    >
                      <title>{`Target: ${d.target}`}</title>
                    </rect>
                  )}
                  <text
                    x={cx}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className="wf-chart-axis-text"
                    fill="var(--wf-muted)"
                    fontSize="7.5"
                    fontFamily="var(--wf-c-sans)"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
