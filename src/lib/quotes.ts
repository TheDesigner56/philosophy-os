import { Quote, Theme } from '@/types';
import { dailyIndex } from './daily';

// Deterministic daily selection: the same calendar day always yields the same
// quote, so the widget, feed, and notification stay in sync without storing state.
export function quoteForDay(quotes: Quote[], date: Date = new Date()): Quote {
  if (quotes.length === 0) throw new Error('quoteForDay: empty quote list');
  return quotes[dailyIndex(quotes.length, date)];
}

/** Prefer quotes matching the user's chosen outcomes; fall back to all. */
export function quoteForDayByOutcome(
  quotes: Quote[],
  themes: Theme[],
  date: Date = new Date(),
): Quote {
  const pool = themes.length ? quotes.filter((q) => themes.includes(q.theme)) : quotes;
  return quoteForDay(pool.length ? pool : quotes, date);
}
