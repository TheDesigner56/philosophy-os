'use client';

import { Tab } from '@/types';

const TABS: { key: Tab; label: string; glyph: string }[] = [
  { key: 'today', label: 'Today', glyph: '◎' },
  { key: 'journal', label: 'Journal', glyph: '✎' },
  { key: 'lessons', label: 'Lessons', glyph: '❧' },
  { key: 'progress', label: 'Progress', glyph: '▤' },
];

export default function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-[#0A0A0A]/90 backdrop-blur">
      <div className="flex pb-safe">
        {TABS.map((t) => {
          const on = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 touch-target ${
                on ? 'text-white' : 'text-white/40'
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>{t.glyph}</span>
              <span className="text-[10px] tracking-wide">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
