import { describe, it, expect } from 'vitest';
import { dailyIndex } from '@/lib/daily';

describe('dailyIndex', () => {
  const date = new Date(2026, 4, 28);

  it('is deterministic for the same date', () => {
    expect(dailyIndex(10, date)).toBe(dailyIndex(10, date));
  });

  it('stays within [0, length)', () => {
    for (let len = 1; len <= 30; len++) {
      const idx = dailyIndex(len, date);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(len);
    }
  });

  it('returns 0 for empty collections', () => {
    expect(dailyIndex(0, date)).toBe(0);
  });

  it('different days can map to different indices', () => {
    const a = dailyIndex(30, new Date(2026, 4, 1));
    const b = dailyIndex(30, new Date(2026, 4, 2));
    // Not guaranteed different, but the salt path must stay stable per-day.
    expect(dailyIndex(30, new Date(2026, 4, 1))).toBe(a);
    expect(dailyIndex(30, new Date(2026, 4, 2))).toBe(b);
  });

  it('salt shifts the sequence independently', () => {
    expect(dailyIndex(30, date, 'lesson')).toBe(dailyIndex(30, date, 'lesson'));
  });
});
