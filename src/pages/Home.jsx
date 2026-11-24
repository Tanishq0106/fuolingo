import React from 'react';
import StreakCard from '../components/StreakCard.jsx';
import TrophyWidget from '../components/badges/TrophyWidget.jsx';
import { DEFAULT_MISSIONS, STREAK_QUALIFY_COUNT, DAILY_MISSION_COUNT } from '../constants.js';

export default function Home({
  profile = {},
  streakState = {},
  countsByDay = {},
  frozenDays = new Set(),
  todayStr = '',
  todayCompletions = [],
  userBadges = [],
  stats = {},
  onToggleMission = () => {},
  onNavigate = () => {},
  onAddWater = () => {}
}) {
  const completedKeys = new Set(todayCompletions.map(c => c.mission_key));
  const todayCount = completedKeys.size;
  const isQualified = todayCount >= STREAK_QUALIFY_COUNT;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-surface-card to-surface-light p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to crush today, {profile.display_name?.split(' ')[0] || 'Athlete'}?
            </h1>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Focus on the habit. Lock in 3 daily missions to extend your streak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('workouts')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-accent hover:bg-accent-hover text-slate-950 shadow-accent-glow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>🏋️ Start Workout</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('log')}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition-colors"
          >
            <span>⚖️ Log Weight</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Daily 4 Missions (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-card rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Daily Missions</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/20 text-accent font-semibold font-mono">
                    {todayCount} / {DAILY_MISSION_COUNT} Done
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Complete at least {STREAK_QUALIFY_COUNT} missions to qualify for your streak.
                </p>
              </div>

              {/* Ring or Progress percent */}
              <div className="text-right">
                <div className="text-2xl font-black text-white font-mono">
                  {Math.round((todayCount / DAILY_MISSION_COUNT) * 100)}%
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Today's Goal
                </div>
              </div>
            </div>

            {/* Missions List */}
            <div className="space-y-3.5">
              {DEFAULT_MISSIONS.map((mission) => {
                const isDone = completedKeys.has(mission.key);

                return (
                  <div
                    key={mission.key}
                    onClick={() => onToggleMission(mission.key)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isDone
                        ? 'bg-accent/10 border-accent/40 shadow-sm'
                        : 'bg-surface/60 border-white/5 hover:border-white/20 hover:bg-surface-light/40'
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isDone}
                    aria-label={`${mission.title}: ${isDone ? 'Completed' : 'Incomplete'}`}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        onToggleMission(mission.key);
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Category Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-accent text-slate-950 font-bold shadow-inner'
                            : 'bg-slate-800 text-slate-400 group-hover:text-white'
                        }`}
                      >
                        {mission.key === 'workout' && '🏋️'}
                        {mission.key === 'calories' && '🥗'}
                        {mission.key === 'water' && '💧'}
                        {mission.key === 'sleep' && '🌙'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-semibold text-sm sm:text-base transition-colors ${
                              isDone ? 'text-white line-through opacity-80' : 'text-slate-100 group-hover:text-accent'
                            }`}
                          >
                            {mission.title}
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            +{mission.xp} XP
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {mission.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Checkbox circle */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? 'bg-accent border-accent text-slate-950 shadow-accent-glow'
                          : 'border-slate-600 bg-slate-800/40 group-hover:border-slate-400'
                      }`}
                    >
                      {isDone && (
                        <svg className="w-4 h-4 stroke-slate-950 stroke-[3]" fill="none" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Water hydration shortcut */}
            <div className="p-4 rounded-2xl bg-surface border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💧</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Quick Hydration</h4>
                  <p className="text-xs text-slate-400">Log water intake in one tap</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onAddWater}
                className="px-3 py-1.5 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-400 hover:bg-sky-900/60 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span>+250 ml</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Streak Card & Trophy Case (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Streak Card */}
          <StreakCard
            currentStreak={streakState.current_streak ?? 0}
            longestStreak={streakState.longest_streak ?? 0}
            freezesAvailable={streakState.freezes_available ?? 1}
            countsByDay={countsByDay}
            frozenDays={frozenDays}
            todayStr={todayStr}
            todayCount={todayCount}
          />

          {/* Mini Trophy Widget below StreakCard */}
          <TrophyWidget
            userBadges={userBadges}
            stats={stats}
            onNavigateToProfile={() => onNavigate('profile')}
          />
        </div>
      </div>
    </div>
  );
}
