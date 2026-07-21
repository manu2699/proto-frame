import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses, layoutClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function DonutChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const defaultData = [
    { label: "Category A", value: 60 },
    { label: "Category B", value: 25 },
    { label: "Category C", value: 15 }
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const sum = data.reduce((acc, d) => acc + d.value, 0) || 1;

  let accumulated = 0;

  const box = (
    <div
      className={"wf-box wf-donutchart-box " + layoutClasses(n) + " " + modClasses(n)}
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
        <div className="wf-chart-body wf-donutchart-body flex items-center justify-center">
          <div className="wf-donut-chart-wrapper flex flex-row items-center justify-center gap-6 w-full">
            <div className="wf-donut-svg-container relative w-[104px] h-[104px] shrink-0">
              <svg viewBox="0 0 40 40" className="wf-donut-svg w-full h-full -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="var(--wf-c-line)"
                  strokeWidth="3.5"
                />
                {data.map((d, i) => {
                  // Small visual gap between wedges (rounded caps eat into the
                  // stroke length, so it's carved out of the segment, not added).
                  const gap = data.length > 1 ? 1.2 : 0;
                  const pct = Math.max((d.value / sum) * 100 - gap, 0);
                  const dashOffset = 100 - accumulated;
                  accumulated += (d.value / sum) * 100;

                  return (
                    <circle
                      key={i}
                      cx="20"
                      cy="20"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeDashoffset={dashOffset}
                      className="wf-donut-segment"
                      style={{ opacity: 1 - i * 0.22 } as React.CSSProperties}
                    >
                      <title>{`${d.label}: ${d.value}`}</title>
                    </circle>
                  );
                })}
              </svg>
              <div className="wf-donut-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
                <span className="wf-donut-center-value">{n.value || sum}</span>
                <span className="wf-donut-center-label">{n.subtitle || "Total"}</span>
              </div>
            </div>
            <div className="wf-donut-legend flex flex-col gap-1.5 text-left min-w-0 flex-1">
              {data.map((d, i) => (
                <div key={i} className="wf-donut-legend-item flex items-center gap-2">
                  <span
                    className="wf-donut-legend-swatch"
                    style={{ opacity: 1 - i * 0.22 }}
                  />
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
