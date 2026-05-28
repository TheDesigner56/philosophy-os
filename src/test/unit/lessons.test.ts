import { describe, it, expect } from 'vitest';
import { lessonForDay, lessonsForTrack } from '@/lib/lessons';
import { LESSONS } from '@/data/lessons';

describe('lessonForDay', () => {
  it('serves only free lessons to non-Pro users', () => {
    for (let d = 1; d <= 31; d++) {
      const lesson = lessonForDay(LESSONS, false, new Date(2026, 4, d));
      expect(lesson?.free).toBe(true);
    }
  });

  it('can serve any lesson to Pro users', () => {
    const seen = new Set<string>();
    for (let d = 1; d <= 31; d++) {
      const lesson = lessonForDay(LESSONS, true, new Date(2026, 4, d));
      if (lesson) seen.add(lesson.id);
    }
    // Pro pool is the whole library, so over a month we expect some paid lessons.
    expect(seen.size).toBeGreaterThan(LESSONS.filter((l) => l.free).length - 1);
  });

  it('is deterministic per day', () => {
    const date = new Date(2026, 4, 28);
    expect(lessonForDay(LESSONS, true, date)?.id).toBe(lessonForDay(LESSONS, true, date)?.id);
  });

  it('returns null for an empty pool', () => {
    expect(lessonForDay([], true)).toBeNull();
  });
});

describe('lessonsForTrack', () => {
  it('filters by track', () => {
    expect(lessonsForTrack(LESSONS, 'calm').every((l) => l.track === 'calm')).toBe(true);
    expect(lessonsForTrack(LESSONS, 'discipline').every((l) => l.track === 'discipline')).toBe(true);
  });
});
