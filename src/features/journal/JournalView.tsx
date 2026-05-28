'use client';

import { useMemo } from 'react';
import { PromptPack } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import { canUsePack, FREE_JOURNAL_HISTORY_DAYS, visibleJournalEntries } from '@/lib/entitlement';

interface JournalViewProps {
  onOpenPack: (pack: PromptPack) => void;
  onUpgrade: (source: string) => void;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function JournalView({ onOpenPack, onUpgrade }: JournalViewProps) {
  const { content, entries, isPro } = useStoic();

  const visible = useMemo(() => visibleJournalEntries(entries, isPro), [entries, isPro]);
  const promptText = useMemo(() => {
    const map: Record<string, string> = {};
    for (const pack of content.promptPacks) for (const p of pack.prompts) map[p.id] = p.text;
    return map;
  }, [content.promptPacks]);
  const packTitle = useMemo(() => {
    const map: Record<string, string> = {};
    for (const pack of content.promptPacks) map[pack.id] = pack.title;
    return map;
  }, [content.promptPacks]);

  return (
    <div className="px-5 pt-[calc(16px+var(--safe-top))] pb-28">
      <h1 className="font-serif text-2xl text-white">Journal</h1>

      <section className="mt-5">
        <p className="mb-2 text-xs tracking-[0.2em] uppercase text-white/35">Prompt packs</p>
        <div className="grid grid-cols-2 gap-3">
          {content.promptPacks.map((pack) => {
            const locked = !canUsePack(pack.free, isPro);
            return (
              <button
                key={pack.id}
                onClick={() => (locked ? onUpgrade('journal_pack') : onOpenPack(pack))}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-white/40">
                    {pack.outcome}
                  </span>
                  {locked && <span className="text-xs text-white/40">🔒</span>}
                </div>
                <h3 className="mt-1.5 font-medium text-white">{pack.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{pack.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs tracking-[0.2em] uppercase text-white/35">History</p>
          {!isPro && (
            <span className="text-[10px] text-white/30">last {FREE_JOURNAL_HISTORY_DAYS} days</span>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/40">
            No entries yet. Write your first line from Today.
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((e) => (
              <li key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-[11px] text-white/35">
                  <span>{e.promptId ? promptText[e.promptId] ?? packTitle[e.packId ?? ''] : 'Free write'}</span>
                  <span>{formatDate(e.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-sm text-white/85 whitespace-pre-wrap">{e.text}</p>
                {(e.mood || e.reactivity) && (
                  <div className="mt-2 flex gap-3 text-[10px] text-white/35">
                    {e.mood && <span>Mood {e.mood}/5</span>}
                    {e.reactivity && <span>Reactivity {e.reactivity}/5</span>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {!isPro && (
          <button
            onClick={() => onUpgrade('journal_history')}
            className="mt-4 w-full rounded-full border border-white/15 py-3 text-sm font-medium text-white/80 touch-target"
          >
            Unlock unlimited history & prompt packs
          </button>
        )}
      </section>
    </div>
  );
}
