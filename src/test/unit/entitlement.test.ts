import { describe, it, expect } from 'vitest';
import { JournalEntry } from '@/types';
import {
  canReadLesson,
  canUsePack,
  FREE_JOURNAL_HISTORY_DAYS,
  visibleJournalEntries,
} from '@/lib/entitlement';

function entry(daysAgo: number, packId = 'free-form'): JournalEntry {
  return {
    id: `e-${daysAgo}-${packId}`,
    createdAt: Date.now() - daysAgo * 86_400_000,
    packId,
    text: 'x',
  };
}

describe('visibleJournalEntries', () => {
  const entries = [entry(0), entry(3), entry(10), entry(1, 'calm-reset')];

  it('Pro sees everything', () => {
    expect(visibleJournalEntries(entries, true)).toHaveLength(4);
  });

  it('free tier hides entries older than the history window', () => {
    const visible = visibleJournalEntries(entries, false);
    expect(visible.some((e) => e.id === entry(10).id)).toBe(false);
  });

  it('free tier hides non-free-form packs', () => {
    const visible = visibleJournalEntries(entries, false);
    expect(visible.some((e) => e.packId === 'calm-reset')).toBe(false);
  });

  it('free tier keeps recent free-form entries', () => {
    const visible = visibleJournalEntries(entries, false);
    expect(visible).toHaveLength(2); // day 0 and day 3
  });

  it('the history window is 7 days', () => {
    expect(FREE_JOURNAL_HISTORY_DAYS).toBe(7);
  });
});

describe('gating helpers', () => {
  it('canUsePack: free packs always, others need Pro', () => {
    expect(canUsePack(true, false)).toBe(true);
    expect(canUsePack(false, false)).toBe(false);
    expect(canUsePack(false, true)).toBe(true);
  });

  it('canReadLesson: free lessons always, others need Pro', () => {
    expect(canReadLesson(true, false)).toBe(true);
    expect(canReadLesson(false, false)).toBe(false);
    expect(canReadLesson(false, true)).toBe(true);
  });
});
