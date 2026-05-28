'use client';

import { useMemo } from 'react';
import { useStoic } from '@/state/StoicProvider';
import { dayKey, daysBetween } from '@/lib/dates';

interface ProgressViewProps {
  onUpgrade: (source: string) => void;
  onOpenSettings: () => void;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-serif text-2xl text-white tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-white/45">{label}</p>
    </div>
  );
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default function ProgressView({ onUpgrade, onOpenSettings }: ProgressViewProps) {
  const { streak, entries, completedLessonIds, savedQuoteIds, isPro } = useStoic();

  const metrics = useMemo(() => {
    const today = dayKey();
    const last30 = entries.filter((e) => daysBetween(dayKey(new Date(e.createdAt)), today) < 30);
    const activeDays = new Set(last30.map((e) => dayKey(new Date(e.createdAt)))).size;
    const reactivity = avg(last30.map((e) => e.reactivity).filter((n): n is number => !!n));
    const mood = avg(last30.map((e) => e.mood).filter((n): n is number => !!n));
    return { activeDays, reactivity, mood, totalEntries: entries.length };
  }, [entries]);

  return (
    <div className="px-5 pt-[calc(16px+var(--safe-top))] pb-28">
      <h1 className="font-serif text-2xl text-white">Progress</h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Current streak" value={`${streak.current}🔥`} />
        <Stat label="Longest streak" value={streak.longest} />
        <Stat label="Entries" value={metrics.totalEntries} />
        <Stat label="Lessons done" value={completedLessonIds.length} />
      </div>

      <section className="mt-7">
        <p className="mb-2 text-xs tracking-[0.2em] uppercase text-white/35">Analytics</p>
        {isPro ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-white/80">Discipline scorecard</p>
              <p className="mt-1 text-xs text-white/45">
                Active {metrics.activeDays} of the last 30 days
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/80"
                  style={{ width: `${Math.round((metrics.activeDays / 30) * 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Avg reactivity (30d)"
                value={metrics.reactivity ? metrics.reactivity.toFixed(1) : '—'}
              />
              <Stat label="Avg mood (30d)" value={metrics.mood ? metrics.mood.toFixed(1) : '—'} />
            </div>
            <Stat label="Saved quotes" value={savedQuoteIds.length} />
          </div>
        ) : (
          <button
            onClick={() => onUpgrade('progress_analytics')}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left"
          >
            <p className="text-white/80">🔒 Reactivity trends & discipline scorecard</p>
            <p className="mt-1 text-sm text-white/45">
              See whether you’re getting calmer and more consistent over time. Unlock with Pro.
            </p>
          </button>
        )}
      </section>

      <button
        onClick={onOpenSettings}
        className="mt-6 w-full rounded-full border border-white/10 py-3 text-sm text-white/55 touch-target"
      >
        Settings
      </button>
    </div>
  );
}
