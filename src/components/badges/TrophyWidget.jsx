import React from 'react';
import { BADGES } from '../../constants.js';
import { getBadgeProgress, getClosestLockedBadge } from '../../utils/badges.js';
import BadgeIcon from './BadgeIcon.jsx';

export default function TrophyWidget({
  userBadges = [],
  stats = { totalMissions: 0, longestStreak: 0, workouts: 0, kgProgress: 0 },
  isLoading = false,
  error = null,
  onNavigateToProfile = () => {}
}) {
  if (error) {
    console.error('TrophyWidget error:', error);
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-surface-card rounded-2xl p-5 border border-white/5 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-12 h-12 rounded-full bg-slate-800"></div>
          ))}
        </div>
      </div>
    );
  }

  // Check if any earned badges are unseen
  const hasUnseen = userBadges.some(b => !b.seen_at);
  const earnedKeys = userBadges.map(b => b.badge_key);

  // Up to 3 most recent unlocked badges
  const recentUnlocked = [...userBadges]
    .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
    .slice(0, 3)
    .map(b => {
      const def = BADGES.find(item => item.key === b.badge_key);
      return { ...def, earnedAt: b.earned_at, isUnlocked: true };
    })
    .filter(Boolean);

  // Next closest locked badge
  const closestLocked = getClosestLockedBadge(stats, earnedKeys);

  // Items to display (up to 4)
  const displayItems = [...recentUnlocked];
  if (closestLocked && displayItems.length < 4) {
    displayItems.push({
      ...closestLocked,
      isUnlocked: false,
      progress: closestLocked.progress
    });
  }

  return (
    <div className="bg-surface-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm sm:text-base text-white">
            Trophy Case
          </h3>
          {hasUnseen && (
            <span
              className="w-2 h-2 rounded-full bg-accent ring-4 ring-accent/20 animate-pulse"
              title="New badge unlocked!"
            />
          )}
        </div>

        <a
          href="/profile#badges"
          onClick={(e) => {
            e.preventDefault();
            onNavigateToProfile('badges');
          }}
          className="text-xs text-accent hover:text-accent-light font-medium flex items-center gap-1 transition-colors"
        >
          View all
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Row of up to 4 icons */}
      <div className="flex items-center gap-3 sm:gap-4 my-2">
        {displayItems.length === 0 ? (
          <div className="text-xs text-slate-400 py-2">
            No badges unlocked yet. Complete your first mission!
          </div>
        ) : (
          displayItems.map((item, idx) => {
            if (item.isUnlocked) {
              return (
                <div
                  key={item.key || idx}
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/30 text-accent shadow-sm"
                  title={`${item.title} (Unlocked)`}
                >
                  <BadgeIcon icon={item.icon} className="w-6 h-6" />
                </div>
              );
            }

            // Locked with progress ring or bar
            return (
              <div
                key={item.key || idx}
                className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-slate-800/80 border border-slate-700/60 text-slate-500"
                title={`${item.title}: ${item.progress.value}/${item.progress.target}`}
              >
                <BadgeIcon icon={item.icon} className="w-5 h-5" />
                {/* Small lock overlay */}
                <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full p-0.5 text-slate-400">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Next target in plain words */}
      {closestLocked && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
          <span className="truncate pr-2">
            <strong className="text-white">Next:</strong> {closestLocked.title}
          </span>
          <span className="font-mono text-accent shrink-0">
            {closestLocked.progress.value} of {closestLocked.progress.target}
          </span>
        </div>
      )}
    </div>
  );
}
