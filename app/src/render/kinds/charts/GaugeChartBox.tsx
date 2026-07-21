import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses, layoutClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

// Semi-circle gauge — single-value progress-toward-goal reading (score, health,
// completion %). Reuses the same value/subtitle/percent fields as kpi/progress
// rather than introducing gauge-specific schema.
export function GaugeChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const percent = Math.max(0, Math.min(100, n.percent ?? 65));

  const cx = 100;
  const cy = 92;
  const r = 72;
  const strokeWidth = 14;
  const arcD = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;

  const box = (
    <div
      className={"wf-box wf-gaugechart-box " + layoutClasses(n) + " " + modClasses(n)}
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
        <div className="wf-chart-body wf-gaugechart-body flex items-center justify-center min-h-[130px]">
          <svg viewBox="0 0 200 118" className="wf-gauge-svg w-full max-w-[220px] h-auto overflow-visible">
            <path
              d={arcD}
              fill="none"
              stroke="var(--wf-c-line)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              d={arcD}
              fill="none"
              stroke="var(--wf-ink)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${percent} ${100 - percent}`}
              className="wf-gauge-value-arc"
            >
              <title>{`${percent}%`}</title>
            </path>
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              className="wf-gauge-value-text"
              fill="var(--wf-ink)"
              fontFamily="var(--wf-font)"
              fontSize="22"
              fontWeight="700"
            >
              {n.value ?? `${percent}%`}
            </text>
            {n.subtitle && (
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                className="wf-gauge-subtitle-text"
                fill="var(--wf-muted)"
                fontFamily="var(--wf-c-sans)"
                fontSize="10.5"
              >
                {n.subtitle}
              </text>
            )}
          </svg>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
