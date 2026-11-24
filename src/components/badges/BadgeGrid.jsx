import React, { useState } from 'react';
import { BADGES } from '../../constants.js';
import { getBadgeProgress } from '../../utils/badges.js';
import BadgeCard from './BadgeCard.jsx';
import BadgeDetailModal from './BadgeDetailModal.jsx';

export default function BadgeGrid({
  userBadges = [], // Array of { badge_key, earned_at, seen_at }
  stats = { totalMissions: 0, longestStreak: 0, workouts: 0, kgProgress: 0 },
  onBadgeSeen = () => {}
}) {
  const [selectedBadgeKey, setSelectedBadgeKey] = useState(null);

  // Map of earned badges
  const earnedMap = new Map();
  userBadges.forEach(b => {
    earnedMap.set(b.badge_key, b);
  });

  const unlockedCount = userBadges.length;
  const totalCount = BADGES.length;

  const handleCardClick = (badgeKey) => {
    setSelectedBadgeKey(badgeKey);
    const badgeData = earnedMap.get(badgeKey);
    if (badgeData && !badgeData.seen_at) {
      onBadgeSeen(badgeKey);
    }
  };

  const selectedBadge = selectedBadgeKey
    ? BADGES.find(b => b.key === selectedBadgeKey)
    : null;
  const selectedBadgeData = selectedBadgeKey ? earnedMap.get(selectedBadgeKey) : null;
  const selectedProgress = selectedBadge ? getBadgeProgress(selectedBadge, stats) : null;

  return (
    <section id="badges" className="space-y-6">
      {/* Header with counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Badges & Achievements</span>
            <span className="text-accent text-sm font-normal py-0.5 px-2.5 rounded-full bg-accent/10 border border-accent/20">
              {unlockedCount} of {totalCount} unlocked
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build habits, lock streaks, and build your permanent fitness trophy case.
          </p>
        </div>

        {unlockedCount === 0 && (
          <div className="text-xs text-slate-400 bg-surface-card px-3 py-1.5 rounded-lg border border-white/5">
            Complete your first mission to earn your first badge.
          </div>
        )}
      </div>

      {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGES.map((badge) => {
          const badgeData = earnedMap.get(badge.key);
          const isUnlocked = Boolean(badgeData);
          const isUnseen = isUnlocked && !badgeData.seen_at;
          const progress = getBadgeProgress(badge, stats);

          return (
            <BadgeCard
              key={badge.key}
              badge={badge}
              isUnlocked={isUnlocked}
              isUnseen={isUnseen}
              earnedAt={badgeData?.earned_at}
              progress={progress}
              onClick={() => handleCardClick(badge.key)}
            />
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          isUnlocked={Boolean(selectedBadgeData)}
          earnedAt={selectedBadgeData?.earned_at}
          progress={selectedProgress}
          onClose={() => setSelectedBadgeKey(null)}
        />
      )}
    </section>
  );
}
