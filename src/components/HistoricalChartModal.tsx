import { useState, useMemo } from 'react';
import { Currency } from '../data/currencies';
import { ratesService } from '../services/ratesService';
import { X, TrendingUp, TrendingDown, Calendar, ArrowRight, Calculator } from 'lucide-react';

interface HistoricalChartModalProps {
  currency: Currency | null;
  onClose: () => void;
  onSelectForCalculator: (code: string) => void;
}

export function HistoricalChartModal({
  currency,
  onClose,
  onSelectForCalculator,
}: HistoricalChartModalProps) {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!currency) return null;

  // Slice history according to selected range
  const dataPoints = useMemo(() => {
    return currency.history30d.slice(-timeRange);
  }, [currency, timeRange]);

  const rates = dataPoints.map((d) => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const range = maxRate - minRate || 1;
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;

  const firstRate = rates[0];
  const lastRate = rates[rates.length - 1];
  const periodChange = ((lastRate - firstRate) / firstRate) * 100;
  const isPositive = periodChange >= 0;

  // SVG Chart Dimensions
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  // Coordinates for the SVG polyline & area fill
  const points = dataPoints.map((dp, idx) => {
    const x = paddingX + (idx / (dataPoints.length - 1)) * plotWidth;
    const y = paddingY + plotHeight - ((dp.rate - minRate) / range) * plotHeight;
    return { x, y, ...dp };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${chartHeight - paddingY} L ${points[0].x.toFixed(1)} ${chartHeight - paddingY} Z`;

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{currency.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  SGD / {currency.code} Historical Trend
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {currency.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Singapore Interbank Daily Reference
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Top Metric Strip */}
          <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-500">Current Reference Rate</div>
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums">
                1 SGD = {ratesService.formatRate(hoveredPoint.rate)} {currency.code}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {hoveredPoint.date} · 1 {currency.code} = S$ {(1 / hoveredPoint.rate).toFixed(4)}
              </div>
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {([7, 14, 30] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setTimeRange(r);
                    setHoverIndex(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}D
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart with hover inspection */}
          <div className="relative mt-4 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingY + plotHeight / 2}
                x2={chartWidth - paddingX}
                y2={paddingY + plotHeight / 2}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#E2E8F0"
              />

              {/* Min & Max rate labels on Y axis */}
              <text
                x={paddingX - 6}
                y={paddingY + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {ratesService.formatRate(maxRate)}
              </text>
              <text
                x={paddingX - 6}
                y={chartHeight - paddingY + 3}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {ratesService.formatRate(minRate)}
              </text>

              {/* Fill area below path */}
              <path d={areaD} fill="url(#areaGrad)" />

              {/* Primary trend line */}
              <path
                d={pathD}
                fill="none"
                stroke={isPositive ? '#059669' : '#E11D48'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive points & hover columns */}
              {points.map((pt, idx) => (
                <g key={idx} onMouseEnter={() => setHoverIndex(idx)} className="cursor-pointer">
                  {/* Invisible wide hit area */}
                  <rect
                    x={pt.x - plotWidth / (points.length * 2)}
                    y={paddingY}
                    width={plotWidth / points.length}
                    height={plotHeight}
                    fill="transparent"
                  />
                  {hoverIndex === idx && (
                    <>
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={chartHeight - paddingY}
                        stroke="#94A3B8"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill={isPositive ? '#059669' : '#E11D48'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </g>
              ))}

              {/* X-axis date endpoints */}
              <text
                x={paddingX}
                y={chartHeight - 6}
                textAnchor="start"
                className="text-[10px] font-mono fill-slate-400"
              >
                {points[0].date}
              </text>
              <text
                x={chartWidth - paddingX}
                y={chartHeight - 6}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {points[points.length - 1].date}
              </text>
            </svg>
          </div>

          {/* Period Statistics Summary */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-center">
              <span className="text-[11px] text-slate-500 block">Period Low</span>
              <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                {ratesService.formatRate(minRate)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-center">
              <span className="text-[11px] text-slate-500 block">Period Average</span>
              <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                {ratesService.formatRate(avgRate)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-center">
              <span className="text-[11px] text-slate-500 block">Period High</span>
              <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                {ratesService.formatRate(maxRate)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {timeRange}-day movement:{' '}
            <strong className={`font-mono ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isPositive ? '+' : ''}{periodChange.toFixed(2)}%
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectForCalculator(currency.code);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Use in Calculator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
