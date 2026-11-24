import React from 'react';
import BadgeIcon from './BadgeIcon.jsx';

export default function BadgeCard({
  badge,
  isUnlocked = false,
  isUnseen = false,
  earnedAt = null,
  progress = { value: 0, target: 1, percent: 0 },
  onClick
}) {
  const formattedEarnedDate = earnedAt
    ? new Date(earnedAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[140px] flex flex-col justify-between group ${
        isUnlocked
          ? 'bg-surface-card border border-accent/40 shadow-accent-glow hover:border-accent hover:scale-[1.02]'
          : 'bg-surface/60 border border-white/5 opacity-70 hover:opacity-90 hover:border-white/15'
      }`}
      aria-label={`${badge.title} badge: ${isUnlocked ? `Unlocked on ${formattedEarnedDate}` : `Locked. Progress: ${progress.value} of ${progress.target}`}`}
    >
      {/* "NEW" marker pill */}
      {isUnlocked && isUnseen && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-accent text-black animate-pulse">
          NEW
        </span>
      )}

      {/* Header: Icon & Lock status */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isUnlocked
              ? 'bg-accent/15 text-accent shadow-inner'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          <BadgeIcon icon={badge.icon} className="w-6 h-6" />
        </div>

        {!isUnlocked && (
          <div className="flex items-center text-slate-500 text-xs gap-1 bg-black/40 px-2 py-1 rounded-md">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
            </svg>
            <span>Locked</span>
          </div>
        )}
      </div>

      {/* Body: Title & Description / Progress */}
      <div>
        <h4 className="font-semibold text-sm sm:text-base text-white group-hover:text-accent transition-colors flex items-center gap-1.5">
          {badge.title}
        </h4>

        {isUnlocked ? (
          <p className="text-xs text-accent/90 mt-1 flex items-center gap-1">
            <span>✨ Unlocked</span>
            {formattedEarnedDate && <span>• {formattedEarnedDate}</span>}
          </p>
        ) : (
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="truncate pr-2">{badge.requirement}</span>
              <span className="font-mono text-slate-300 font-medium">
                {progress.value} / {progress.target}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
