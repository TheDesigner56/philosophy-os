import { dayKey } from './dates';

// FNV-1a hash → stable per-day index. Same calendar day always maps to the same
// item, so quote/lesson selection needs no stored cursor.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dailyIndex(length: number, date: Date = new Date(), salt = ''): number {
  if (length <= 0) return 0;
  return hashString(salt + dayKey(date)) % length;
}
