// Local-day helpers. A "dayKey" is a YYYY-MM-DD string in the user's local
// timezone — the unit streaks and the daily quote are keyed on.

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole calendar days between two dayKeys (b - a). Negative if b precedes a. */
export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/** True when `prev` is exactly the calendar day before `current`. */
export function isYesterday(prev: string, current: string): boolean {
  return daysBetween(prev, current) === 1;
}

export function monthKey(d: Date = new Date()): string {
  return dayKey(d).slice(0, 7); // YYYY-MM
}
