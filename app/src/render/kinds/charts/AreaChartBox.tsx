import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses, layoutClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

// Same trend-line data shape as LineChartBox, but the emphasis flips: a solid
// filled area (volume/magnitude reading) instead of a thin line with discrete
// point markers (rate-of-change reading). Kept as a separate kind rather than
// a "filled" mod on chart:line since the two read differently at a glance.
export function AreaChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const defaultData = [
    { label: "Jan", value: 20 },
    { label: "Feb", value: 45 },
    { label: "Mar", value: 35 },
    { label: "Apr", value: 60 },
    { label: "May", value: 50 },
    { label: "Jun", value: 78 },
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const svgWidth = 200;
  const svgHeight = 100;
  const paddingLeft = 20;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + chartHeight;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const linePathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPathD = points.length > 0
    ? linePathD + ` L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : "";

  const gridFractions = [0.25, 0.5, 0.75];

  const box = (
    <div
      className={"wf-box wf-areachart-box " + layoutClasses(n) + " " + modClasses(n)}
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
        <div className="wf-chart-body wf-areachart-body flex items-center justify-center min-h-[140px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="wf-areachart-svg w-full h-full max-h-[160px] overflow-visible">
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

            {areaPathD && <path d={areaPathD} className="wf-chart-area-fill-solid" fill="var(--wf-ink)" stroke="none" />}
            {linePathD && (
              <path d={linePathD} fill="none" stroke="var(--wf-ink)" strokeWidth="1.5" className="wf-chart-line-path" />
            )}

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
