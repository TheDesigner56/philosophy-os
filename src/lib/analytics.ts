import { AnalyticsEvent, AnalyticsName } from '@/types';
import { KEYS, load, save } from './storage';

// First-party, on-device analytics — no third-party SDKs, no network, ATT-safe.
// Powers the funnel views in Progress and is exportable.
const MAX_EVENTS = 1000;

export function track(name: AnalyticsName, meta?: AnalyticsEvent['meta']): void {
  const events = load<AnalyticsEvent[]>(KEYS.analytics, []);
  events.push({ name, at: Date.now(), meta });
  save(KEYS.analytics, events.slice(-MAX_EVENTS));
}

export function getEvents(): AnalyticsEvent[] {
  return load<AnalyticsEvent[]>(KEYS.analytics, []);
}

export function countByName(events: AnalyticsEvent[]): Record<string, number> {
  return events.reduce<Record<string, number>>((acc, e) => {
    acc[e.name] = (acc[e.name] ?? 0) + 1;
    return acc;
  }, {});
}
