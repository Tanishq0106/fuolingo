import { MILESTONE_STEP_KG } from '../constants.js';

/**
 * Computes milestone progression toward target weight
 * direction: -1 for fat loss, +1 for muscle gain, 0 for stay fit (no milestones)
 * @param {{ startKg: number, currentKg: number, targetKg: number, goal: string }} params
 * @returns {{ kgProgress: number, nextKg: number|null, kgToGo: number|null, done: boolean }}
 */
export function milestoneInfo({ startKg, currentKg, targetKg, goal }) {
  const dir = goal === 'fat_loss' ? -1 : goal === 'muscle_gain' ? 1 : 0;
  if (dir === 0) {
    return { kgProgress: 0, nextKg: null, kgToGo: null, done: false };
  }

  const sKg = Number(startKg);
  const cKg = Number(currentKg);
  const tKg = Number(targetKg);

  const moved = Math.max(0, (cKg - sKg) * dir);             // kg moved toward the goal
  const completed = Math.floor(moved / MILESTONE_STEP_KG);
  let nextKg = sKg + dir * (completed + 1) * MILESTONE_STEP_KG;
  
  // clamp to the target
  if ((tKg - nextKg) * dir < 0) {
    nextKg = tKg;
  }
  
  const kgToGo = Math.max(0, (nextKg - cKg) * dir);
  const done = (tKg - cKg) * dir <= 0;

  return {
    kgProgress: Number(moved.toFixed(2)),
    nextKg: Number(nextKg.toFixed(2)),
    kgToGo: Number(kgToGo.toFixed(2)),
    done
  };
}
