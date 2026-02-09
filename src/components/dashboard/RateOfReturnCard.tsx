import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RateOfReturnCardProps {
  confidencePct: number;
  message: string;
  timeRange: "5Y" | "1Y" | "6M";
}

/** Chart data: blue line (baseline), green line (higher performance). Y in thousands (0-1400K) */
const BLUE_LINE = [200, 350, 520, 720, 920, 1100, 1250];
const GREEN_LINE = [250, 450, 680, 950, 1220, 1320, 1380];
const X_LABELS = ["Now", "5 yrs", "10 yrs", "15 yrs", "20 yrs", "25 yrs", "30 yrs"];
const Y_TICKS = [0, 200, 400, 600, 800, 1000, 1200, 1400];
const Y_MAX = 1400;

const formatYLabel = (v: number) => `$${v}K`;
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

/**
 * Rate of Return - Figma 595-1716
 * Subtitle, 5Y/1Y/6M tabs, line chart with Y-axis, X-axis, grid, two lines, data points, shaded area
 */
export const RateOfReturnCard = ({ confidencePct, message, timeRange: initialRange }: RateOfReturnCardProps) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState(initialRange);
  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number } | null>(null);

  const w = 520;
  const h = 280;
  const padding = { top: 20, right: 20, bottom: 36, left: 48 };
  const chartWidth = w - padding.left - padding.right;
  const chartHeight = h - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / (X_LABELS.length - 1)) * chartWidth;
  const yScale = (v: number) => padding.top + chartHeight - (v / Y_MAX) * chartHeight;

  const bluePath = BLUE_LINE.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ");
  const greenPath = GREEN_LINE.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ");
  const areaPath =
    BLUE_LINE.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ") +
    " L " + [6, 5, 4, 3, 2, 1, 0].map((i) => `${xScale(i)} ${yScale(GREEN_LINE[i])}`).join(" L ") +
    " Z";

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * w;
    const index = Math.max(
      0,
      Math.min(
        X_LABELS.length - 1,
        Math.round(((svgX - padding.left) / chartWidth) * (X_LABELS.length - 1))
      )
    );
    setTooltip({ index, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <article className="ped-ror bg-card rounded-xl border border-slate-200 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 min-h-fit w-full min-w-0">
      <div className="ped-ror__header flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="ped-ror__title m-0 mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Rate of Return
          </h2>
          <p className="ped-ror__sub m-0 text-sm text-slate-500 dark:text-slate-400">
            Historical performance across all plans
          </p>
        </div>
        <div className="ped-ror__tabs flex gap-2">
          {(["5Y", "1Y", "6M"] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`ped-ror__tab px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === r
                  ? "bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100"
                  : "bg-transparent text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
              onClick={() => setTimeRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="ped-ror__chart relative mb-4">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="ped-ror__chart-svg w-full h-auto cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleChartMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="ror-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {Y_TICKS.map((v, i) => (
            <line
              key={`hy-${i}`}
              x1={padding.left}
              y1={yScale(v)}
              x2={w - padding.right}
              y2={yScale(v)}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}
          {X_LABELS.map((_, i) => (
            <line
              key={`vx-${i}`}
              x1={xScale(i)}
              y1={padding.top}
              x2={xScale(i)}
              y2={h - padding.bottom}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}
          {/* Y-axis labels */}
          {Y_TICKS.map((v, i) => (
            <text
              key={i}
              x={padding.left - 8}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="currentColor"
              className="text-slate-500 dark:text-slate-400"
            >
              {formatYLabel(v)}
            </text>
          ))}
          {/* X-axis labels */}
          {X_LABELS.map((label, i) => (
            <text
              key={i}
              x={xScale(i)}
              y={h - 10}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              className="text-slate-500 dark:text-slate-400"
            >
              {label}
            </text>
          ))}
          {/* Shaded area between lines */}
          <path d={areaPath} fill="url(#ror-area-fill)" />
          {/* Blue line */}
          <path d={bluePath} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {BLUE_LINE.map((v, i) => (
            <circle key={`b-${i}`} cx={xScale(i)} cy={yScale(v)} r="4" fill="#2563eb" />
          ))}
          {/* Green line */}
          <path d={greenPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {GREEN_LINE.map((v, i) => (
            <circle key={`g-${i}`} cx={xScale(i)} cy={yScale(v)} r="4" fill="#22c55e" />
          ))}
        </svg>
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:shadow-black/50"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12, transform: "translate(0, -50%)" }}
          >
            <div className="font-medium text-slate-900 dark:text-slate-100">{X_LABELS[tooltip.index]}</div>
            <div className="text-blue-600 dark:text-blue-400">{formatCurrency(BLUE_LINE[tooltip.index] * 1000)}</div>
            <div className="text-emerald-600 dark:text-emerald-400">{formatCurrency(GREEN_LINE[tooltip.index] * 1000)}</div>
          </div>
        )}
      </div>

      {/* Confidence Indicator - light green section */}
      <div className="ped-ror__confidence flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30 dark:border dark:border-emerald-800/30 mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="shrink-0" aria-hidden>
          <path d="M 0 20 L 4 16 L 8 20 L 16 12 L 24 20" />
        </svg>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-slate-900 dark:text-slate-100">Confidence Indicator: {confidencePct}%</span>
          <span className="block text-sm text-slate-600 dark:text-slate-400">{message}</span>
        </div>
      </div>

      <button
        type="button"
        className="ped-ror__btn w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        onClick={() => navigate("/enrollment/investments")}
      >
        Maintain Strategy
      </button>
    </article>
  );
};
