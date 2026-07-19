import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";
import { useSketchLine } from "../../sketch/SketchLine";

export function BarChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();
  const axisYLine = useSketchLine({ edge: "left" });
  const axisXLine = useSketchLine({ edge: "bottom" });

  const defaultData = [
    { label: "A", value: 40 },
    { label: "B", value: 75, target: 80 },
    { label: "C", value: 50 },
    { label: "D", value: 90, target: 85 },
    { label: "E", value: 60 }
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0)), 1);

  const box = (
    <div
      className={"wf-box wf-barchart-box " + modClasses(n)}
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
        <div className="wf-chart-body wf-barchart-body relative flex-1 w-full min-h-[120px] flex flex-col justify-end">
          <div className="wf-chart-axis-y absolute left-0 top-0 bottom-[20px] z-[1]">{axisYLine}</div>
          <div className="wf-chart-axis-x absolute left-0 right-0 bottom-[20px] z-[1]">{axisXLine}</div>
          <div className="wf-chart-bars flex justify-around items-end h-full pl-2.5 pb-[20px] z-[2] relative">
            {data.map((d, i) => {
              const valPct = (d.value / maxVal) * 100;
              const hasTarget = d.target !== undefined;
              const tgtPct = hasTarget ? ((d.target ?? 0) / maxVal) * 100 : 0;

              return (
                <div key={i} className="wf-chart-bar-group flex-1 flex flex-col items-center max-w-[60px] h-full justify-end">
                  <div className="wf-chart-bar-cols flex items-end justify-center gap-1 w-full h-[calc(100%-20px)]">
                    <div
                      className="wf-chart-bar-main w-3.5 rounded-t-[2px] transition-[height] duration-300 ease-in-out"
                      style={{ height: `${valPct}%` }}
                      title={`Value: ${d.value}`}
                    />
                    {hasTarget && (
                      <div
                        className="wf-chart-bar-target w-2 rounded-t-[1px] transition-[height] duration-300 ease-in-out"
                        style={{ height: `${tgtPct}%` }}
                        title={`Target: ${d.target}`}
                      />
                    )}
                  </div>
                  <span className="wf-chart-bar-label mt-1.5 whitespace-nowrap text-ellipsis overflow-hidden max-w-full">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
