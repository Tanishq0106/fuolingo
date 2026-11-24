import { milestoneInfo } from './milestones.js';
import { getBadgeProgress, evaluateBadges } from './badges.js';
import { calculateStreak, evaluateMissedDays } from './streak.js';
import { buildSmoothPath } from './chart.js';

console.log('--- Testing Milestone Info (Section 6.4 Example) ---');
const example = milestoneInfo({ startKg: 84.0, currentKg: 79.8, targetKg: 72.0, goal: 'fat_loss' });
console.log('Milestone test result:', example);
console.assert(example.kgProgress === 4.2, 'kgProgress should be 4.2');
console.assert(example.nextKg === 79.0, 'nextKg should be 79.0');
console.assert(example.kgToGo === 0.8, 'kgToGo should be 0.8');
console.assert(example.done === false, 'done should be false');

console.log('\n--- Testing Badge Evaluation ---');
const sampleStats = { totalMissions: 1, longestStreak: 3, workouts: 0, kgProgress: 1.2 };
const earned = evaluateBadges(sampleStats, []);
console.log('Evaluated badges for sample stats:', earned);
console.assert(earned.includes('first_mission'), 'Should include first_mission');
console.assert(earned.includes('streak_3'), 'Should include streak_3');
console.assert(earned.includes('first_kg'), 'Should include first_kg');

console.log('\n--- Testing Derive-then-cache Streak with Freeze ---');
const counts = {
  '2026-11-12': 3,
  '2026-11-13': 0, // missed day
  '2026-11-14': 4,
  '2026-11-15': 3  // today qualified
};
const frozen = new Set(['2026-11-13']); // freeze applied
const streakResult = calculateStreak({
  countsByDay: counts,
  frozenDays: frozen,
  todayStr: '2026-11-15',
  qualifyCount: 3
});
console.log('Streak result with freeze:', streakResult);
// Today (1) + Nov 14 (1) + Nov 13 (frozen, 0 added) + Nov 12 (1) = 3 days streak!
console.assert(streakResult.currentStreak === 3, 'Streak should be 3 days');

console.log('\n--- Testing Smooth Chart Path ---');
const pts = [{ x: 50, y: 100 }, { x: 100, y: 90 }, { x: 150, y: 70 }, { x: 200, y: 50 }];
const path = buildSmoothPath(pts);
console.log('Smooth SVG path:', path.substring(0, 50) + '...');

console.log('\nAll pure gamification utility tests PASSED!');
