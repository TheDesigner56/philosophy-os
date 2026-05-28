'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  AnalyticsName,
  JournalEntry,
  Outcome,
  ProductId,
  StreakState,
  UserPrefs,
} from '@/types';
import { KEYS, load, save } from '@/lib/storage';
import { initialStreak, recordAction } from '@/lib/streak';
import { dayKey } from '@/lib/dates';
import { track as trackEvent } from '@/lib/analytics';
import { BUNDLED_CONTENT, ContentBundle, loadContent } from '@/lib/content';

const DEFAULT_PREFS: UserPrefs = {
  onboarded: false,
  outcomes: [],
  reminderTime: null,
  notificationsEnabled: false,
};

interface StoicContextValue {
  hydrated: boolean;
  content: ContentBundle;
  prefs: UserPrefs;
  isPro: boolean;
  entries: JournalEntry[];
  streak: StreakState;
  savedQuoteIds: string[];
  completedLessonIds: string[];
  completeOnboarding: (p: Partial<UserPrefs> & { outcomes: Outcome[] }) => void;
  setPro: (value: boolean) => void;
  purchase: (productId: ProductId) => void;
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'createdAt'>) => JournalEntry;
  toggleSaveQuote: (id: string) => void;
  completeLesson: (id: string) => void;
  recordDailyAction: () => void;
  track: (name: AnalyticsName, meta?: Record<string, string | number | boolean>) => void;
}

const StoicContext = createContext<StoicContextValue | null>(null);

// Returns false during SSR + hydration, true afterward — without a setState-in-effect.
// Lets us read localStorage on the client without risking a hydration mismatch.
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function StoicProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const [content, setContent] = useState<ContentBundle>(BUNDLED_CONTENT);
  // Lazy initializers read persisted state on the client (fallback on the server).
  const [prefs, setPrefs] = useState<UserPrefs>(() => load(KEYS.prefs, DEFAULT_PREFS));
  const [isPro, setIsPro] = useState<boolean>(() => load(KEYS.entitlement, false));
  const [entries, setEntries] = useState<JournalEntry[]>(() => load(KEYS.journal, []));
  const [streak, setStreak] = useState<StreakState>(() => load(KEYS.streak, initialStreak()));
  const [savedQuoteIds, setSavedQuoteIds] = useState<string[]>(() => load(KEYS.savedQuotes, []));
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() =>
    load(KEYS.lessons, []),
  );
  const proRef = useRef(isPro);
  useEffect(() => {
    proRef.current = isPro;
  }, [isPro]);

  // Daily content pull with bundled fallback (no-op unless a remote URL is set).
  useEffect(() => {
    let active = true;
    loadContent({ remoteUrl: process.env.NEXT_PUBLIC_CONTENT_URL }).then((c) => {
      if (active) setContent(c);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist slices once hydrated (avoids clobbering storage during SSR/hydration).
  useEffect(() => { if (hydrated) save(KEYS.prefs, prefs); }, [prefs, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.journal, entries); }, [entries, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.streak, streak); }, [streak, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.savedQuotes, savedQuoteIds); }, [savedQuoteIds, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.lessons, completedLessonIds); }, [completedLessonIds, hydrated]);

  const track = useCallback(
    (name: AnalyticsName, meta?: Record<string, string | number | boolean>) => trackEvent(name, meta),
    [],
  );

  const recordDailyAction = useCallback(() => {
    setStreak((prev) => {
      const next = recordAction(prev, dayKey(), { isPro: proRef.current });
      if (next.current > prev.current) trackEvent('streak_increment', { current: next.current });
      return next;
    });
  }, []);

  const completeOnboarding = useCallback((p: Partial<UserPrefs> & { outcomes: Outcome[] }) => {
    setPrefs((prev) => ({ ...prev, ...p, onboarded: true }));
    trackEvent('onboarding_complete', { outcomes: p.outcomes.join(',') });
  }, []);

  const setPro = useCallback((value: boolean) => {
    setIsPro(value);
    proRef.current = value;
    save(KEYS.entitlement, value);
  }, []);

  // TODO(decision): replace with StoreKit 2 purchase flow on iOS (Stripe on web).
  const purchase = useCallback(
    (productId: ProductId) => {
      trackEvent('purchase', { product: productId });
      setPro(true);
    },
    [setPro],
  );

  const addJournalEntry = useCallback(
    (e: Omit<JournalEntry, 'id' | 'createdAt'>) => {
      const entry: JournalEntry = { ...e, id: crypto.randomUUID(), createdAt: Date.now() };
      setEntries((prev) => [entry, ...prev]);
      trackEvent('journal_save', e.packId ? { pack: e.packId } : undefined);
      recordDailyAction();
      return entry;
    },
    [recordDailyAction],
  );

  const toggleSaveQuote = useCallback((id: string) => {
    setSavedQuoteIds((prev) => {
      if (prev.includes(id)) return prev.filter((q) => q !== id);
      trackEvent('quote_save', { id });
      return [id, ...prev];
    });
  }, []);

  const completeLesson = useCallback(
    (id: string) => {
      setCompletedLessonIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      trackEvent('lesson_complete', { id });
      recordDailyAction();
    },
    [recordDailyAction],
  );

  const value = useMemo<StoicContextValue>(
    () => ({
      hydrated,
      content,
      prefs,
      isPro,
      entries,
      streak,
      savedQuoteIds,
      completedLessonIds,
      completeOnboarding,
      setPro,
      purchase,
      addJournalEntry,
      toggleSaveQuote,
      completeLesson,
      recordDailyAction,
      track,
    }),
    [
      hydrated, content, prefs, isPro, entries, streak, savedQuoteIds, completedLessonIds,
      completeOnboarding, setPro, purchase, addJournalEntry, toggleSaveQuote, completeLesson,
      recordDailyAction, track,
    ],
  );

  return <StoicContext.Provider value={value}>{children}</StoicContext.Provider>;
}

export function useStoic(): StoicContextValue {
  const ctx = useContext(StoicContext);
  if (!ctx) throw new Error('useStoic must be used within StoicProvider');
  return ctx;
}
