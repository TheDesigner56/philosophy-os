// Stoic OS — core domain models.
// Every type here maps to one of two user outcomes: Calm or Disciplined.

/** The two transformations the product sells. */
export type Outcome = 'calm' | 'discipline';

/** Lesson tracks mirror the two outcomes. */
export type Track = Outcome;

/** Visual/topical theme used for quote rotation + share-card styling. */
export type Theme = 'calm' | 'discipline' | 'general';

export interface Quote {
  id: string;
  text: string;
  author: string;
  theme: Theme;
}

export interface Lesson {
  id: string;
  track: Track;
  title: string;
  /** One concept, 60–90 sec read. */
  body: string;
  /** The single one-action takeaway. */
  action: string;
  /** Free starter lessons are unlocked without Pro. */
  free: boolean;
}

/** A single journaling prompt belonging to a pack. */
export interface Prompt {
  id: string;
  text: string;
  /** Optional follow-up shown after the first answer (e.g. evening "why"). */
  followUp?: string;
}

export interface PromptPack {
  id: string;
  outcome: Outcome;
  title: string;
  description: string;
  prompts: Prompt[];
  /** Free-form is the only free pack; structured packs are Pro. */
  free: boolean;
}

export interface JournalEntry {
  id: string;
  /** ms epoch — when the entry was written. */
  createdAt: number;
  /** Pack the entry came from, if any (free-form entries have none). */
  packId?: string;
  promptId?: string;
  text: string;
  /** 1–5, optional quick self-rating, feeds analytics. */
  mood?: number;
  /** 1–5, how reactive the user felt; lower is calmer. */
  reactivity?: number;
}

export interface StreakState {
  current: number;
  longest: number;
  /** dayKey (YYYY-MM-DD) of the last day a qualifying action happened. */
  lastActiveDay: string | null;
  /** Pro: streak insurance — 1 freeze granted per month. */
  freezesRemaining: number;
  /** monthKey (YYYY-MM) the current freeze allotment was granted for. */
  freezeMonth: string | null;
}

/** Lightweight first-party analytics events (no third-party tracking). */
export type AnalyticsName =
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'quote_view'
  | 'quote_save'
  | 'quote_share'
  | 'journal_save'
  | 'lesson_complete'
  | 'paywall_view'
  | 'trial_start'
  | 'purchase'
  | 'streak_increment';

export interface AnalyticsEvent {
  name: AnalyticsName;
  at: number;
  meta?: Record<string, string | number | boolean>;
}

export interface UserPrefs {
  onboarded: boolean;
  /** Which outcomes the user picked in onboarding (drives starting content). */
  outcomes: Outcome[];
  /** Local reminder time "HH:MM", null if not set. */
  reminderTime: string | null;
  notificationsEnabled: boolean;
}

/** Subscription products. Prices are placeholders for the web build —
 *  on iOS these come from App Store Connect, never hard-coded. */
export type ProductId = 'annual' | 'monthly' | 'founding';

export interface Product {
  id: ProductId;
  title: string;
  /** Display price string. TODO(decision): pull live from StoreKit on iOS. */
  price: string;
  period: string;
  blurb: string;
  /** Days of free trial (0 = none). */
  trialDays: number;
  badge?: string;
}

export type Tab = 'today' | 'journal' | 'lessons' | 'progress';

export const OUTCOMES: { key: Outcome; label: string; tagline: string }[] = [
  { key: 'calm', label: 'Calm', tagline: 'Stop overreacting. Reset fast.' },
  { key: 'discipline', label: 'Disciplined', tagline: 'Show up daily without willpower.' },
];
