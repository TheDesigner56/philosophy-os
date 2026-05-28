import { StreakState } from '@/types';
import { daysBetween, monthKey } from './dates';

export const FREEZES_PER_MONTH = 1;

export function initialStreak(): StreakState {
  return { current: 0, longest: 0, lastActiveDay: null, freezesRemaining: 0, freezeMonth: null };
}

/** Pro-only: refresh the monthly freeze allotment when a new month begins. */
export function grantMonthlyFreeze(state: StreakState, today: string): StreakState {
  const m = monthKey(new Date(`${today}T00:00:00`));
  if (state.freezeMonth === m) return state;
  return { ...state, freezesRemaining: FREEZES_PER_MONTH, freezeMonth: m };
}

/**
 * Record a qualifying daily action (open + 1 action). Idempotent within a day.
 * With Pro, a single missed day is automatically covered by a streak freeze.
 */
export function recordAction(
  state: StreakState,
  today: string,
  opts: { isPro: boolean } = { isPro: false },
): StreakState {
  let s = opts.isPro ? grantMonthlyFreeze(state, today) : state;

  if (s.lastActiveDay === today) return s; // already counted today

  let current: number;
  if (s.lastActiveDay === null) {
    current = 1;
  } else {
    const gap = daysBetween(s.lastActiveDay, today);
    if (gap === 1) {
      current = s.current + 1;
    } else if (gap === 2 && opts.isPro && s.freezesRemaining > 0) {
      current = s.current + 1; // freeze covers the one missed day
      s = { ...s, freezesRemaining: s.freezesRemaining - 1 };
    } else {
      current = 1; // gap too large (or no freeze) — streak resets
    }
  }

  return {
    ...s,
    current,
    longest: Math.max(s.longest, current),
    lastActiveDay: today,
  };
}

/** True the evening of a day the user hasn't acted yet but has a live streak. */
export function isAtRisk(state: StreakState, today: string): boolean {
  return state.current > 0 && state.lastActiveDay !== null && state.lastActiveDay !== today;
}
