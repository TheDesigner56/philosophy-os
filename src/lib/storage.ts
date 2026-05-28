// Tiny typed localStorage wrapper. Local-first by design (the iOS build uses
// SwiftData + an App Group; CloudKit/remote sync is a Pro/v2 concern).
// TODO(decision): optional cloud backup for Pro (see TRD 6.1).

const PREFIX = 'stoic-os:';

export function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota / private mode — ignore, app stays usable in-memory
  }
}

export const KEYS = {
  prefs: 'prefs',
  entitlement: 'entitlement',
  journal: 'journal',
  streak: 'streak',
  savedQuotes: 'savedQuotes',
  lessons: 'lessonsCompleted',
  analytics: 'analytics',
} as const;
