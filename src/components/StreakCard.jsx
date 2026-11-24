import React from 'react';
import StreakShield from './StreakShield.jsx';
import { STREAK_QUALIFY_COUNT, MAX_FREEZES } from '../constants.js';
import { formatLocalDate, addDays } from '../utils/streak.js';

export default function StreakCard({
  currentStreak = 0,
  longestStreak = 0,
  freezesAvailable = 1,
  countsByDay = {},
  frozenDays = new Set(),
  todayStr = formatLocalDate(),
  todayCount = 0
}) {
  const isQualifiedToday = todayCount >= STREAK_QUALIFY_COUNT;
  const frozenSet = frozenDays instanceof Set ? frozenDays : new Set(frozenDays);

  // Generate 7-day window (past 6 days + today)
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = addDays(todayStr, -i);
    const dateObj = new Date(dStr + 'T12:00:00');
    const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    const isToday = dStr === todayStr;
    const count = isToday ? todayCount : (countsByDay[dStr] ?? 0);
    const qualified = count >= STREAK_QUALIFY_COUNT;
    const isFrozen = frozenSet.has(dStr);

    weekDays.push({
      dateStr: dStr,
      dayName,
      isToday,
      count,
      qualified,
      isFrozen
    });
  }

  return (
    <div className="relative overflow-hidden bg-surface-card rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-streak/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Streak title & Shields */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Daily Momentum
        </span>
        <StreakShield freezesAvailable={freezesAvailable} maxFreezes={MAX_FREEZES} />
      </div>

      {/* Main Counter Display */}
      <div className="flex items-baseline gap-3 my-4">
        <div className="flex items-center gap-2">
          <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
            {currentStreak}
          </span>
          <span className="text-3xl sm:text-4xl animate-flame origin-bottom">
            🔥
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-streak uppercase tracking-wider">
            Day Streak
          </span>
          <span className="text-xs text-slate-400">
            Personal Best: {longestStreak} days
          </span>
        </div>
      </div>

      {/* Status / Encouraging message */}
      <div className="text-xs sm:text-sm text-slate-300 mb-6 flex items-center gap-2">
        {currentStreak === 0 ? (
          <span>Your streak ended. Start a new one today! 🚀</span>
        ) : isQualifiedToday ? (
          <span className="text-accent flex items-center gap-1.5 font-medium">
            <span>✓</span> Today's streak is locked in! Great consistency.
          </span>
        ) : (
          <span className="text-slate-300">
            Complete <strong className="text-white">{Math.max(0, STREAK_QUALIFY_COUNT - todayCount)} more</strong> mission{STREAK_QUALIFY_COUNT - todayCount === 1 ? '' : 's'} today to keep the flame alive.
          </span>
        )}
      </div>

      {/* 7-Day Dots Row */}
      <div className="pt-4 border-t border-white/5">
        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map((d) => (
            <div key={d.dateStr} className="flex flex-col items-center gap-2">
              <span className={`text-[11px] font-medium ${d.isToday ? 'text-accent font-bold' : 'text-slate-400'}`}>
                {d.dayName}
              </span>

              {/* Status Dot / Glyph */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                  d.isFrozen
                    ? 'bg-sky-500/20 border border-sky-400 text-sky-400 shadow-shield-glow'
                    : d.qualified
                    ? 'bg-streak/20 border border-streak text-streak shadow-streak-glow'
                    : d.isToday
                    ? 'bg-slate-800 border-2 border-dashed border-accent/60 text-slate-400'
                    : 'bg-slate-800/60 border border-white/5 text-slate-600'
                }`}
                title={`${d.dayName} (${d.dateStr}): ${
                  d.isFrozen ? 'Protected by Streak Shield' : d.qualified ? 'Streak Qualified' : 'Not qualified'
                }`}
              >
                {d.isFrozen ? (
                  <svg className="w-4 h-4 fill-sky-400/20 stroke-sky-400" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ) : d.qualified ? (
                  <svg className="w-4 h-4 fill-streak stroke-streak" viewBox="0 0 24 24">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                ) : (
                  <div className={`w-2 h-2 rounded-full ${d.isToday ? 'bg-accent/60 animate-ping' : 'bg-slate-700'}`} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-streak" />
            <span>Streak locked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Protected (Shield)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-slate-600" />
            <span>Incomplete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
