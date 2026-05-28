'use client';

import { useStoic } from '@/state/StoicProvider';
import { isAtRisk } from '@/lib/streak';
import { dayKey } from '@/lib/dates';

export default function StreakBadge() {
  const { streak } = useStoic();
  const atRisk = isAtRisk(streak, dayKey());
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
        atRisk ? 'border-amber-400/40 text-amber-300' : 'border-white/15 text-white/80'
      }`}
      title={atRisk ? 'Streak at risk — do one action today' : 'Current streak'}
    >
      <span aria-hidden>{atRisk ? '⚠' : '🔥'}</span>
      <span className="font-medium tabular-nums">{streak.current}</span>
    </div>
  );
}
