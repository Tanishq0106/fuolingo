import React, { useState, useMemo } from 'react';
import {
  computeChartLayout,
  computeMovingAverages,
  downsampleDaily,
  filterLogsByRange
} from '../utils/chart.js';
import { milestoneInfo } from '../utils/milestones.js';
import { CHART_DEFAULT_RANGE_DAYS } from '../constants.js';

export default function WeightChart({
  logs = [],
  startKg = 84.0,
  targetKg = 72.0,
  goal = 'fat_loss',
  onLogClick
}) {
  const [range, setRange] = useState(CHART_DEFAULT_RANGE_DAYS); // 30 | 90 | 'all'
  const [activeDot, setActiveDot] = useState(null);

  // Milestone progression math
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const currentKg = latestLog ? latestLog.weightKg : startKg;
  const milestone = useMemo(() => {
    return milestoneInfo({ startKg, currentKg, targetKg, goal });
  }, [startKg, currentKg, targetKg, goal]);

  // Process data: filter range, downsample, and compute 7-day moving averages
  const chartData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const downsampled = downsampleDaily(sorted);
    const inRange = filterLogsByRange(downsampled, range);
    return computeMovingAverages(inRange);
  }, [logs, range]);

  // Compute SVG layout and scales
  const layout = useMemo(() => {
    return computeChartLayout({
      logs: chartData,
      startKg,
      targetKg,
      width: 800,
      height: 320
    });
  }, [chartData, startKg, targetKg]);

  const milestoneY = milestone.nextKg ? layout.getY(milestone.nextKg) : null;

  return (
    <div className="bg-surface-card rounded-3xl p-5 sm:p-7 border border-white/5 shadow-xl relative overflow-hidden">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Weight Progression Trend
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold">
              7-Day Trend
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Noise-filtered moving average tracking true biological changes.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
          {[
            { label: '30D', val: 30 },
            { label: '90D', val: 90 },
            { label: 'All', val: 'all' }
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => setRange(btn.val)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === btn.val
                  ? 'bg-accent text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Milestone Banner (if goal is not stay_fit) */}
      {goal !== 'stay_fit' && milestone.nextKg && (
        <div className="flex items-center justify-between p-3.5 mb-4 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-streak font-bold text-base">🚩</span>
            <span className="text-slate-200">
              Next Milestone: <strong className="text-streak font-semibold">{milestone.nextKg} kg</strong>
            </span>
          </div>
          <span className="text-slate-400 font-mono">
            {milestone.kgToGo > 0 ? `${milestone.kgToGo} kg to go` : 'Goal reached! 🎉'}
          </span>
        </div>
      )}

      {/* SVG Chart Container */}
      <div className="relative w-full aspect-[800/320] bg-slate-950/40 rounded-2xl border border-white/5 p-2 overflow-hidden">
        <svg
          viewBox="0 0 800 320"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label={`Weight trend from ${startKg} kg to ${currentKg} kg. Target is ${targetKg} kg.`}
        >
          <title>Weight Progression Chart</title>
          <desc>
            {`Weight trend chart showing logs, 7-day moving average curve, start weight of ${startKg}kg, and target of ${targetKg}kg.`}
          </desc>

          {/* Grid Y-lines & Ticks */}
          {layout.yTicks.map((tick) => (
            <g key={tick.value} className="text-slate-600">
              <line
                x1={layout.padding.left}
                y1={tick.y}
                x2={layout.width - layout.padding.right}
                y2={tick.y}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeDasharray="4 4"
              />
              <text
                x={layout.padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[11px] font-mono fill-slate-500"
              >
                {tick.value} kg
              </text>
            </g>
          ))}

          {/* Horizontal Start Weight Line */}
          <g>
            <line
              x1={layout.padding.left}
              y1={layout.startLineY}
              x2={layout.width - layout.padding.right}
              y2={layout.startLineY}
              stroke="#94A3B8"
              strokeDasharray="6 4"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <text
              x={layout.width - layout.padding.right + 8}
              y={layout.startLineY + 4}
              className="text-[10px] font-medium fill-slate-400"
            >
              Start ({startKg}kg)
            </text>
          </g>

          {/* Horizontal Target Weight Line */}
          <g>
            <line
              x1={layout.padding.left}
              y1={layout.targetLineY}
              x2={layout.width - layout.padding.right}
              y2={layout.targetLineY}
              stroke="#8B5CF6"
              strokeDasharray="6 4"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
            <text
              x={layout.width - layout.padding.right + 8}
              y={layout.targetLineY + 4}
              className="text-[10px] font-medium fill-violet-400"
            >
              Target ({targetKg}kg)
            </text>
          </g>

          {/* Next Milestone Dotted Line */}
          {milestoneY && (
            <g>
              <line
                x1={layout.padding.left}
                y1={milestoneY}
                x2={layout.width - layout.padding.right}
                y2={milestoneY}
                stroke="#F97316"
                strokeDasharray="3 3"
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
              <circle cx={layout.padding.left + 15} cy={milestoneY} r="4" fill="#F97316" />
            </g>
          )}

          {/* Empty state message if no data */}
          {chartData.length === 0 && (
            <text
              x={layout.width / 2}
              y={layout.height / 2}
              textAnchor="middle"
              className="text-sm fill-slate-400 font-medium"
            >
              Log your first weigh-in to start your trend.
            </text>
          )}

          {/* Smooth Trend Curve Line */}
          {layout.trendPath && (
            <path
              d={layout.trendPath}
              fill="none"
              stroke="#10E774"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_8px_rgba(16,231,116,0.5)]"
            />
          )}

          {/* Data Dots */}
          {layout.dots.map((dot, idx) => (
            <g key={idx}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r={activeDot?.date === dot.date ? 6 : 4}
                className="fill-slate-300 stroke-slate-900 cursor-pointer transition-all duration-150 hover:fill-accent hover:scale-125 focus:fill-accent focus:outline-none"
                strokeWidth="2"
                tabIndex={0}
                role="button"
                aria-label={`Logged ${dot.weightKg} kg on ${new Date(dot.date).toLocaleDateString()}`}
                onMouseEnter={() => setActiveDot(dot)}
                onMouseLeave={() => setActiveDot(null)}
                onFocus={() => setActiveDot(dot)}
                onBlur={() => setActiveDot(null)}
                onClick={() => onLogClick?.(dot)}
              />
            </g>
          ))}

          {/* X Axis Date Ticks */}
          {layout.xTicks.map((tick, i) => (
            <text
              key={i}
              x={tick.x}
              y={layout.height - 12}
              textAnchor="middle"
              className="text-[11px] font-mono fill-slate-400"
            >
              {tick.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {activeDot && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-900/95 border border-accent/40 text-xs shadow-2xl backdrop-blur-md"
            style={{
              left: `${(activeDot.x / 800) * 100}%`,
              top: `${(activeDot.y / 320) * 100}%`,
              transform: 'translate(-50%, -130%)'
            }}
          >
            <div className="font-bold text-accent font-mono text-sm">
              {activeDot.weightKg} kg
            </div>
            <div className="text-[10px] text-slate-300">
              {new Date(activeDot.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            {activeDot.avgWeightKg && (
              <div className="text-[9px] text-slate-400 mt-0.5">
                7D Trend: {activeDot.avgWeightKg} kg
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety Notice & Metric Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-accent rounded" />
            <span>7-Day Moving Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>Weigh-in Dot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-violet-400 border-dashed rounded" />
            <span>Target Line</span>
          </div>
        </div>

        <p className="italic text-slate-500">
          Healthy progress is gradual. Talk to a doctor before aggressive dietary changes.
        </p>
      </div>
    </div>
  );
}
