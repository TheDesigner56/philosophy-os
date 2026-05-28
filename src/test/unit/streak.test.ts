import { describe, it, expect } from 'vitest';
import { grantMonthlyFreeze, initialStreak, isAtRisk, recordAction } from '@/lib/streak';

describe('recordAction', () => {
  it('starts a streak at 1', () => {
    const s = recordAction(initialStreak(), '2026-05-01');
    expect(s.current).toBe(1);
    expect(s.longest).toBe(1);
    expect(s.lastActiveDay).toBe('2026-05-01');
  });

  it('is idempotent within the same day', () => {
    let s = recordAction(initialStreak(), '2026-05-01');
    s = recordAction(s, '2026-05-01');
    expect(s.current).toBe(1);
  });

  it('increments on consecutive days', () => {
    let s = recordAction(initialStreak(), '2026-05-01');
    s = recordAction(s, '2026-05-02');
    s = recordAction(s, '2026-05-03');
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
  });

  it('resets after a missed day on the free tier', () => {
    let s = recordAction(initialStreak(), '2026-05-01');
    s = recordAction(s, '2026-05-02');
    s = recordAction(s, '2026-05-04'); // skipped the 3rd
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });

  it('remembers the longest streak after a reset', () => {
    let s = initialStreak();
    for (const d of ['2026-05-01', '2026-05-02', '2026-05-03']) s = recordAction(s, d);
    s = recordAction(s, '2026-05-06'); // big gap, reset
    expect(s.current).toBe(1);
    expect(s.longest).toBe(3);
  });

  it('Pro: a freeze covers a single missed day', () => {
    const pro = { isPro: true };
    let s = recordAction(initialStreak(), '2026-05-01', pro);
    expect(s.freezesRemaining).toBe(1); // granted for the month
    s = recordAction(s, '2026-05-03', pro); // missed the 2nd, freeze covers it
    expect(s.current).toBe(2);
    expect(s.freezesRemaining).toBe(0);
  });

  it('Pro: streak resets once the freeze is spent', () => {
    const pro = { isPro: true };
    let s = recordAction(initialStreak(), '2026-05-01', pro);
    s = recordAction(s, '2026-05-03', pro); // uses freeze
    s = recordAction(s, '2026-05-05', pro); // no freeze left -> reset
    expect(s.current).toBe(1);
  });

  it('free tier never consumes a freeze', () => {
    let s = recordAction(initialStreak(), '2026-05-01');
    s = recordAction(s, '2026-05-03');
    expect(s.current).toBe(1);
    expect(s.freezesRemaining).toBe(0);
  });
});

describe('grantMonthlyFreeze', () => {
  it('grants once per month and refreshes on a new month', () => {
    let s = grantMonthlyFreeze(initialStreak(), '2026-05-01');
    expect(s.freezesRemaining).toBe(1);
    s = { ...s, freezesRemaining: 0 };
    s = grantMonthlyFreeze(s, '2026-05-20'); // same month, no refresh
    expect(s.freezesRemaining).toBe(0);
    s = grantMonthlyFreeze(s, '2026-06-01'); // new month, refresh
    expect(s.freezesRemaining).toBe(1);
  });
});

describe('isAtRisk', () => {
  it('is true when there is a live streak but no action today', () => {
    const s = recordAction(initialStreak(), '2026-05-01');
    expect(isAtRisk(s, '2026-05-02')).toBe(true);
  });

  it('is false once today has an action', () => {
    const s = recordAction(initialStreak(), '2026-05-02');
    expect(isAtRisk(s, '2026-05-02')).toBe(false);
  });

  it('is false with no streak', () => {
    expect(isAtRisk(initialStreak(), '2026-05-02')).toBe(false);
  });
});
