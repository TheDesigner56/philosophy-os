import { describe, it, expect } from 'vitest';
import { Quote } from '@/types';
import { quoteForDay, quoteForDayByOutcome } from '@/lib/quotes';
import { QUOTES } from '@/data/quotes';

const sample: Quote[] = [
  { id: 'a', text: 'Calm one', author: 'X', theme: 'calm' },
  { id: 'b', text: 'Discipline one', author: 'Y', theme: 'discipline' },
  { id: 'c', text: 'General one', author: 'Z', theme: 'general' },
];

describe('quoteForDay', () => {
  it('returns the same quote for the same day', () => {
    const date = new Date(2026, 4, 28);
    expect(quoteForDay(QUOTES, date).id).toBe(quoteForDay(QUOTES, date).id);
  });

  it('always returns a quote from the list', () => {
    const ids = new Set(QUOTES.map((q) => q.id));
    for (let d = 1; d <= 31; d++) {
      expect(ids.has(quoteForDay(QUOTES, new Date(2026, 4, d)).id)).toBe(true);
    }
  });

  it('throws on an empty list', () => {
    expect(() => quoteForDay([])).toThrow();
  });
});

describe('quoteForDayByOutcome', () => {
  it('filters to the chosen themes', () => {
    const q = quoteForDayByOutcome(sample, ['calm'], new Date(2026, 4, 28));
    expect(q.theme).toBe('calm');
  });

  it('falls back to all quotes when no themes are given', () => {
    const q = quoteForDayByOutcome(sample, [], new Date(2026, 4, 28));
    expect(sample.some((s) => s.id === q.id)).toBe(true);
  });

  it('falls back to all quotes when no quote matches the theme', () => {
    const onlyCalm: Quote[] = [{ id: 'a', text: 't', author: 'a', theme: 'calm' }];
    const q = quoteForDayByOutcome(onlyCalm, ['discipline'], new Date(2026, 4, 28));
    expect(q.id).toBe('a');
  });
});
