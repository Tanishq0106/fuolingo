import { BADGES } from '../constants.js';

/**
 * Computes progress toward a badge given user stats
 * @param {object} badge 
 * @param {object} stats - { totalMissions, longestStreak, workouts, kgProgress }
 * @returns {{ value: number, current: number, target: number, done: boolean, percent: number, formatted: string }}
 */
export function getBadgeProgress(badge, stats = {}) {
  const value = stats[badge.metric] ?? 0;
  const current = Math.min(value, badge.target);
  const done = value >= badge.target;
  const percent = Math.min(100, Math.round((current / badge.target) * 100));
  
  return {
    value: current,
    current,
    target: badge.target,
    done,
    percent,
    formatted: `${current} / ${badge.target}`
  };
}

/**
 * Returns the keys of badges whose requirement is met but are not yet earned.
 * @param {object} stats 
 * @param {string[]} earnedKeys 
 * @returns {string[]}
 */
export function evaluateBadges(stats, earnedKeys = []) {
  return BADGES
    .filter(b => !earnedKeys.includes(b.key) && getBadgeProgress(b, stats).done)
    .map(b => b.key);
}

/**
 * Finds the closest locked badge (highest progress ratio).
 * Supports both getClosestLockedBadge(stats, earnedKeys) and getClosestLockedBadge(badges, earnedKeys, stats)
 * @param {object|Array} firstArg 
 * @param {string[]} earnedKeys 
 * @param {object} [thirdArg] 
 * @returns {object|null}
 */
export function getClosestLockedBadge(firstArg, earnedKeys = [], thirdArg = null) {
  let catalog = BADGES;
  let stats = {};
  let keys = earnedKeys;

  if (Array.isArray(firstArg)) {
    catalog = firstArg;
    stats = thirdArg || {};
  } else {
    stats = firstArg || {};
  }

  const lockedBadges = catalog.filter(b => !keys.includes(b.key));
  if (lockedBadges.length === 0) return null;

  let bestBadge = null;
  let highestRatio = -1;

  for (const badge of lockedBadges) {
    const progress = getBadgeProgress(badge, stats);
    const ratio = badge.target > 0 ? progress.value / badge.target : 0;
    if (ratio > highestRatio) {
      highestRatio = ratio;
      bestBadge = { ...badge, progress };
    }
  }

  return bestBadge;
}
