import {
  STREAK_QUALIFY_COUNT,
  MAX_FREEZES,
  MONTHLY_FREEZE_GRANT,
  FREEZE_MILESTONE_REWARDS,
  FREEZE_COVERS
} from '../constants.js';

/**
 * Formats a Date object to 'YYYY-MM-DD' in user's local timezone
 * @param {Date} date 
 * @returns {string}
 */
export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns 'YYYY-MM' for monthly freeze grant checks
 * @param {Date} date 
 * @returns {string}
 */
export function formatYearMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Adds or subtracts days from a 'YYYY-MM-DD' string
 * @param {string} dateStr 
 * @param {number} days 
 * @returns {string}
 */
export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatLocalDate(dt);
}

/**
 * Pure derive-then-cache streak calculation.
 * 
 * @param {Object} params
 * @param {Record<string, number>} params.countsByDay - { 'YYYY-MM-DD': completedMissionCount }
 * @param {Set<string>|Array<string>} params.frozenDays - Set of 'YYYY-MM-DD' dates where a freeze was used
 * @param {string} [params.todayStr] - Current local date 'YYYY-MM-DD'
 * @param {number} [params.qualifyCount=STREAK_QUALIFY_COUNT]
 * @returns {{ currentStreak: number, qualifiesToday: boolean }}
 */
export function calculateStreak({
  countsByDay = {},
  frozenDays = new Set(),
  todayStr = formatLocalDate(),
  qualifyCount = STREAK_QUALIFY_COUNT
}) {
  const frozenSet = frozenDays instanceof Set ? frozenDays : new Set(frozenDays);

  const qualifies = (day) => (countsByDay[day] ?? 0) >= qualifyCount;
  const covered = (day) => qualifies(day) || frozenSet.has(day);

  let streak = 0;
  const qualifiesToday = qualifies(todayStr);

  // If today is already qualified, it counts toward the streak
  if (qualifiesToday) {
    streak += 1;
  }

  // Walk backwards starting from yesterday
  let d = addDays(todayStr, -1);
  while (covered(d)) {
    if (qualifies(d)) {
      streak += 1; // frozen days keep streak alive but add 0 to count
    }
    d = addDays(d, -1);
  }

  return {
    currentStreak: streak,
    qualifiesToday
  };
}

/**
 * Evaluates monthly freeze grant eligibility
 * @param {number} currentFreezes 
 * @param {string|null} lastGrantMonth - e.g. '2026-10'
 * @param {string} currentMonth - e.g. '2026-11'
 * @returns {{ newFreezes: number, granted: boolean, updatedMonth: string }}
 */
export function checkMonthlyFreezeGrant(currentFreezes, lastGrantMonth, currentMonth = formatYearMonth()) {
  if (lastGrantMonth !== currentMonth) {
    const updatedFreezes = Math.min(MAX_FREEZES, currentFreezes + MONTHLY_FREEZE_GRANT);
    const granted = updatedFreezes > currentFreezes;
    return {
      newFreezes: updatedFreezes,
      granted,
      updatedMonth: currentMonth
    };
  }
  return {
    newFreezes: currentFreezes,
    granted: false,
    updatedMonth: lastGrantMonth
  };
}

/**
 * Identifies missed days between the last qualifying/active day and yesterday.
 * Checks if streak freezes can cover them.
 */
export function evaluateMissedDays({
  countsByDay = {},
  frozenDays = new Set(),
  freezesAvailable = 1,
  lastActiveDay = null,
  todayStr = formatLocalDate()
}) {
  if (!lastActiveDay) {
    return { newFrozenDays: [], remainingFreezes: freezesAvailable, streakBroken: false };
  }

  const frozenSet = new Set(frozenDays);
  const newFrozenDays = [];
  let currentFreezes = freezesAvailable;
  let streakBroken = false;

  let checkDay = addDays(lastActiveDay, 1);
  const yesterday = addDays(todayStr, -1);

  while (checkDay <= yesterday) {
    const count = countsByDay[checkDay] ?? 0;
    const isMissed = FREEZE_COVERS === 'below_threshold'
      ? count < STREAK_QUALIFY_COUNT
      : count === 0;

    if (isMissed && !frozenSet.has(checkDay)) {
      if (currentFreezes > 0) {
        newFrozenDays.push(checkDay);
        frozenSet.add(checkDay);
        currentFreezes -= 1;
      } else {
        // Uncovered missed day breaks the streak
        streakBroken = true;
        break;
      }
    }
    checkDay = addDays(checkDay, 1);
  }

  return {
    newFrozenDays,
    remainingFreezes: currentFreezes,
    streakBroken
  };
}
