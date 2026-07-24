import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses, layoutClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function LineChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  // Default sinusoidal / wave trend data
  const defaultData = [
    { label: "Jan", value: 30, target: 50 },
    { label: "Feb", value: 55, target: 50 },
    { label: "Mar", value: 40, target: 50 },
    { label: "Apr", value: 75, target: 50 },
    { label: "May", value: 60, target: 50 },
    { label: "Jun", value: 85, target: 50 }
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0)), 1);

  // SVG Layout dimensions
  const svgWidth = 200;
  const svgHeight = 100;
  const paddingLeft = 20;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates for value points
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Construct path descriptor for the main line
  const linePathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";

  // Closed area path (line + drop to baseline) for a faint fill under the trend.
  const areaPathD = points.length > 0
    ? linePathD +
      ` L ${points[points.length - 1].x} ${paddingTop + chartHeight}` +
      ` L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  const gridFractions = [0.25, 0.5, 0.75];

  // Check if there is any target value defined
  const targetPoint = data.find((d) => d.target !== undefined);
  const hasConstantTarget = targetPoint !== undefined;
  const targetVal = targetPoint?.target ?? 0;
  const targetY = paddingTop + chartHeight - (targetVal / maxVal) * chartHeight;

  const box = (
    <div
      className={"wf-box wf-linechart-box " + layoutClasses(n) + " " + modClasses(n)}
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
        <div className="wf-chart-body wf-linechart-body flex items-center justify-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="wf-linechart-svg w-full h-full max-h-[140px] overflow-visible">
            {/* Faint horizontal gridlines for readability */}
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

            {/* Area fill under the trend line */}
            {areaPathD && (
              <path d={areaPathD} className="wf-chart-area-fill" fill="var(--wf-ink)" stroke="none" />
            )}

            {/* Grid & Axis Lines */}
            <line
              x1={paddingLeft}
              y1={paddingTop + chartHeight}
              x2={paddingLeft + chartWidth}
              y2={paddingTop + chartHeight}
              className="wf-chart-axis-line"
              stroke="var(--wf-line)"
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={paddingTop + chartHeight}
              className="wf-chart-axis-line"
              stroke="var(--wf-line)"
              strokeWidth="1"
            />

            {/* Target Threshold Line */}
            {hasConstantTarget && (
              <line
                x1={paddingLeft}
                y1={targetY}
                x2={paddingLeft + chartWidth}
                y2={targetY}
                className="wf-chart-target-line"
                stroke="var(--wf-muted)"
                strokeDasharray="3,3"
                strokeWidth="1.2"
              >
                <title>{`Target: ${targetVal}`}</title>
              </line>
            )}

            {/* Main Polyline Path */}
            {linePathD && (
              <path
                d={linePathD}
                fill="none"
                stroke="var(--wf-ink)"
                strokeWidth="2"
                className="wf-chart-line-path"
              />
            )}

            {/* Data point handles */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                className="wf-chart-line-dot"
                fill="var(--wf-ink)"
                stroke="var(--wf-fill)"
                strokeWidth="1"
              >
                <title>{`${p.label}: ${p.value}`}</title>
              </circle>
            ))}

            {/* X Axis Labels */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={svgHeight - 4}
                textAnchor="middle"
                className="wf-chart-axis-text"
                fill="var(--wf-muted)"
                fontSize="7.5"
                fontFamily="var(--wf-c-sans)"
              >
                {p.label}
              </text>
            ))}
          </svg>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
