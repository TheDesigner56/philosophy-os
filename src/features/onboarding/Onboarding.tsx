'use client';

import { useEffect, useMemo, useState } from 'react';
import { Outcome, OUTCOMES } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import { quoteForDayByOutcome } from '@/lib/quotes';
import { requestNotificationPermission } from '@/lib/notifications';
import { BRAND } from '@/lib/brand';

const STEPS = 4;

export default function Onboarding() {
  const { content, addJournalEntry, completeOnboarding, track } = useStoic();
  const [step, setStep] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [firstLine, setFirstLine] = useState('');
  const [firstSaved, setFirstSaved] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [notifWanted, setNotifWanted] = useState(true);

  useEffect(() => {
    track('onboarding_start');
  }, [track]);

  const quote = useMemo(
    () => quoteForDayByOutcome(content.quotes, outcomes.length ? outcomes : ['calm', 'discipline']),
    [content.quotes, outcomes],
  );

  const toggleOutcome = (o: Outcome) =>
    setOutcomes((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  const saveFirst = () => {
    if (!firstLine.trim()) return;
    addJournalEntry({ text: firstLine.trim(), packId: 'free-form' });
    setFirstSaved(true);
  };

  const finish = async () => {
    let notificationsEnabled = false;
    if (notifWanted) notificationsEnabled = await requestNotificationPermission();
    completeOnboarding({
      outcomes: outcomes.length ? outcomes : ['calm', 'discipline'],
      reminderTime,
      notificationsEnabled,
    });
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS - 1));

  return (
    <div className="fixed inset-0 flex justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-md flex flex-col px-6 pt-[calc(24px+var(--safe-top))] pb-safe">
        {/* progress dots */}
        <div className="flex gap-1.5 justify-center pt-2 pb-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-white/90' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {step === 0 && (
            <div className="view-enter">
              <p className="text-[11px] tracking-[0.3em] uppercase text-white/40">{BRAND.appName}</p>
              <h1 className="mt-4 font-serif text-3xl leading-tight text-white">
                Become unshakeable in 30 days.
              </h1>
              <p className="mt-4 text-white/60 leading-relaxed">
                Stop overreacting. Start following through. A pocket operating system for a calmer,
                more disciplined you — one glance, one line at a time.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="view-enter">
              <h2 className="font-serif text-2xl text-white">What do you want more of?</h2>
              <p className="mt-2 text-white/50 text-sm">Pick one or both. We’ll tailor your content.</p>
              <div className="mt-6 space-y-3">
                {OUTCOMES.map((o) => {
                  const active = outcomes.includes(o.key);
                  return (
                    <button
                      key={o.key}
                      onClick={() => toggleOutcome(o.key)}
                      className={`w-full text-left rounded-2xl border p-4 transition-colors touch-target ${
                        active ? 'border-white/80 bg-white/10' : 'border-white/15 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{o.label}</span>
                        <span className={`text-lg ${active ? 'opacity-100' : 'opacity-30'}`}>✓</span>
                      </div>
                      <p className="mt-1 text-white/50 text-sm">{o.tagline}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="view-enter">
              <h2 className="font-serif text-2xl text-white">Your first win</h2>
              <p className="mt-2 text-white/50 text-sm">Read this. Then write one honest line.</p>
              <blockquote className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-serif text-xl leading-snug text-white/90">“{quote.text}”</p>
                <footer className="mt-3 text-white/45 text-sm italic">— {quote.author}</footer>
              </blockquote>
              <textarea
                value={firstLine}
                onChange={(e) => setFirstLine(e.target.value)}
                placeholder="What does this bring up for you?"
                rows={3}
                disabled={firstSaved}
                className="mt-4 w-full rounded-2xl border border-white/15 bg-white/[0.03] p-4 text-white placeholder:text-white/30 outline-none focus:border-white/40 disabled:opacity-60"
              />
              {!firstSaved ? (
                <button
                  onClick={saveFirst}
                  disabled={!firstLine.trim()}
                  className="mt-3 w-full rounded-full bg-white py-3 font-medium text-black disabled:opacity-30 touch-target"
                >
                  Save my first entry
                </button>
              ) : (
                <p className="mt-3 text-center text-sm text-emerald-400/80">
                  Saved. That’s a streak of 1 — your first win.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="view-enter">
              <h2 className="font-serif text-2xl text-white">Stay consistent</h2>
              <p className="mt-2 text-white/50 text-sm">A gentle nudge at the same time each day.</p>
              <label className="mt-6 flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.03] p-4">
                <span className="text-white">Daily reminder</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-transparent text-white outline-none"
                />
              </label>
              <label className="mt-3 flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.03] p-4 touch-target">
                <span className="text-white">Enable notifications</span>
                <input
                  type="checkbox"
                  checked={notifWanted}
                  onChange={(e) => setNotifWanted(e.target.checked)}
                  className="h-5 w-5 accent-white"
                />
              </label>
              <p className="mt-4 text-center text-xs text-white/30">
                You can change these anytime in Settings.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4">
          {step < STEPS - 1 ? (
            <button
              onClick={next}
              disabled={step === 2 && !firstSaved}
              className="w-full rounded-full bg-white py-3.5 font-medium text-black disabled:opacity-30 touch-target"
            >
              {step === 2 ? 'Continue' : 'Continue'}
            </button>
          ) : (
            <button
              onClick={finish}
              className="w-full rounded-full bg-white py-3.5 font-medium text-black touch-target"
            >
              Enter Stoic OS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
