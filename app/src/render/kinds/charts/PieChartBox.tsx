import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses, layoutClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Full pie sectors from center — unlike DonutChartBox (a stroked ring, no
// center hole), each slice here is a real wedge path since a pie can't be
// faked with the ring's stroke-dasharray trick once there's no hole to keep it a ring.
function sectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToXY(cx, cy, r, endAngle);
  const end = polarToXY(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function PieChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const defaultData = [
    { label: "Category A", value: 60 },
    { label: "Category B", value: 25 },
    { label: "Category C", value: 15 },
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const sum = data.reduce((acc, d) => acc + d.value, 0) || 1;

  const r = 18;
  const cx = 20;
  const cy = 20;
  let angle = 0;
  const slices = data.map((d) => {
    const sweep = (d.value / sum) * 360;
    const path = sectorPath(cx, cy, r, angle, angle + sweep);
    angle += sweep;
    return { ...d, path };
  });

  const box = (
    <div
      className={"wf-box wf-piechart-box " + layoutClasses(n) + " " + modClasses(n)}
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
        <div className="wf-chart-body wf-piechart-body flex items-center justify-center">
          <div className="wf-pie-chart-wrapper flex flex-row items-center justify-center gap-6 w-full">
            <div className="wf-pie-svg-container w-[104px] h-[104px] shrink-0">
              <svg viewBox="0 0 40 40" className="wf-pie-svg w-full h-full -rotate-0">
                {slices.map((s, i) => (
                  <path
                    key={i}
                    d={s.path}
                    className="wf-pie-segment"
                    fill="currentColor"
                    stroke="var(--wf-bg)"
                    strokeWidth="0.5"
                    style={{ opacity: 1 - i * 0.22 } as React.CSSProperties}
                  >
                    <title>{`${s.label}: ${s.value}`}</title>
                  </path>
                ))}
              </svg>
            </div>
            <div className="wf-donut-legend flex flex-col gap-1.5 text-left min-w-0 flex-1">
              {data.map((d, i) => (
                <div key={i} className="wf-donut-legend-item flex items-center gap-2">
                  <span className="wf-donut-legend-swatch" style={{ opacity: 1 - i * 0.22 }} />
                  <span className="wf-donut-legend-text">
                    {d.label} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
