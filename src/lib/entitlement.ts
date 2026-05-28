import { JournalEntry } from '@/types';
import { daysBetween, dayKey } from './dates';

// Free-tier limits. All Pro gating funnels through `isPro` (single source of truth).
export const FREE_JOURNAL_HISTORY_DAYS = 7;

/** Journal entries visible on the free tier: free-form only, last 7 days. */
export function visibleJournalEntries(entries: JournalEntry[], isPro: boolean): JournalEntry[] {
  if (isPro) return entries;
  const today = dayKey();
  return entries.filter((e) => {
    const withinWindow = daysBetween(dayKey(new Date(e.createdAt)), today) < FREE_JOURNAL_HISTORY_DAYS;
    const isFreeForm = !e.packId || e.packId === 'free-form';
    return withinWindow && isFreeForm;
  });
}

/** A pack is usable if it's the free pack or the user is Pro. */
export function canUsePack(packFree: boolean, isPro: boolean): boolean {
  return packFree || isPro;
}

/** A lesson is readable if it's a free starter lesson or the user is Pro. */
export function canReadLesson(lessonFree: boolean, isPro: boolean): boolean {
  return lessonFree || isPro;
}
