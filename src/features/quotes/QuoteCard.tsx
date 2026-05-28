'use client';

import { Quote } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import { shareQuote } from './shareCard';

interface QuoteCardProps {
  quote: Quote;
  hero?: boolean;
  onReflect: (quote: Quote) => void;
}

export default function QuoteCard({ quote, hero = false, onReflect }: QuoteCardProps) {
  const { savedQuoteIds, toggleSaveQuote, track } = useStoic();
  const saved = savedQuoteIds.includes(quote.id);

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.03] ${hero ? 'p-6' : 'p-5'}`}
    >
      <p className={`font-serif text-white/90 leading-snug ${hero ? 'text-2xl' : 'text-lg'}`}>
        “{quote.text}”
      </p>
      <p className="mt-3 text-white/45 text-sm italic">— {quote.author}</p>

      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={() => toggleSaveQuote(quote.id)}
          aria-pressed={saved}
          aria-label={saved ? 'Unsave quote' : 'Save quote'}
          className={`flex-1 rounded-full border py-2.5 text-sm font-medium touch-target transition-colors ${
            saved ? 'border-white/70 bg-white/10 text-white' : 'border-white/15 text-white/70'
          }`}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => {
            track('quote_share', { id: quote.id });
            void shareQuote(quote);
          }}
          aria-label="Share quote"
          className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-medium text-white/70 touch-target"
        >
          Share
        </button>
        <button
          onClick={() => onReflect(quote)}
          aria-label="Reflect on quote"
          className="flex-1 rounded-full bg-white py-2.5 text-sm font-medium text-black touch-target"
        >
          Reflect
        </button>
      </div>
    </div>
  );
}
