'use client';

import { useState } from 'react';
import { PromptPack } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import Sheet from '@/components/Sheet';

interface JournalComposerProps {
  onClose: () => void;
  pack: PromptPack | null;
  prefillText?: string;
}

function Scale({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{label}</span>
      </div>
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 rounded-xl border py-2 text-sm touch-target ${
              value === n ? 'border-white/80 bg-white/15 text-white' : 'border-white/15 text-white/50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/30">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

// Mounted fresh per open (keyed by the shell), so initial state comes straight
// from props — no reset effect needed.
export default function JournalComposer({ onClose, pack, prefillText }: JournalComposerProps) {
  const { addJournalEntry } = useStoic();
  const isFreeForm = !pack || pack.id === 'free-form';
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState(prefillText ?? '');
  const [mood, setMood] = useState<number | undefined>();
  const [reactivity, setReactivity] = useState<number | undefined>();

  const hasContent = isFreeForm
    ? freeText.trim().length > 0
    : Object.values(answers).some((a) => a.trim().length > 0);

  const save = () => {
    if (!hasContent) return;
    if (isFreeForm) {
      addJournalEntry({ text: freeText.trim(), packId: 'free-form', mood, reactivity });
    } else {
      for (const prompt of pack!.prompts) {
        const text = answers[prompt.id]?.trim();
        if (text) {
          addJournalEntry({ text, packId: pack!.id, promptId: prompt.id, mood, reactivity });
        }
      }
    }
    onClose();
  };

  return (
    <Sheet open onClose={onClose} keyId={pack?.id ?? 'free-form'} ariaLabel="Journal entry">
      <div className="px-5 pb-6 pt-1">
        <h3 className="font-serif text-xl text-white">{pack && !isFreeForm ? pack.title : 'Free write'}</h3>
        {pack && !isFreeForm && <p className="mt-1 text-sm text-white/45">{pack.description}</p>}

        <div className="mt-5 space-y-5">
          {isFreeForm ? (
            <textarea
              autoFocus
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="What’s on your mind?"
              rows={6}
              className="w-full rounded-2xl border border-white/15 bg-white/[0.03] p-4 text-white placeholder:text-white/30 outline-none focus:border-white/40"
            />
          ) : (
            pack!.prompts.map((prompt) => (
              <div key={prompt.id}>
                <label className="text-sm text-white/80">{prompt.text}</label>
                <textarea
                  value={answers[prompt.id] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [prompt.id]: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.03] p-3 text-white placeholder:text-white/30 outline-none focus:border-white/40"
                />
                {prompt.followUp && (answers[prompt.id]?.trim()?.length ?? 0) > 0 && (
                  <p className="mt-1 text-xs text-white/35">{prompt.followUp}</p>
                )}
              </div>
            ))
          )}

          <Scale label="Mood" value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
          <Scale
            label="Reactivity"
            value={reactivity}
            onChange={setReactivity}
            lowLabel="Calm"
            highLabel="Reactive"
          />
        </div>

        <button
          onClick={save}
          disabled={!hasContent}
          className="mt-6 w-full rounded-full bg-white py-3 font-medium text-black disabled:opacity-30 touch-target"
        >
          Save entry
        </button>
      </div>
    </Sheet>
  );
}
