'use client';

import { useMemo } from 'react';
import { Lesson, Quote } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import { quoteForDayByOutcome } from '@/lib/quotes';
import { lessonForDay } from '@/lib/lessons';
import { BRAND } from '@/lib/brand';
import QuoteCard from '@/features/quotes/QuoteCard';
import StreakBadge from '@/features/streaks/StreakBadge';

interface TodayViewProps {
  onReflect: (quote: Quote) => void;
  onOpenLesson: (lesson: Lesson) => void;
  onJournal: () => void;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayView({ onReflect, onOpenLesson, onJournal }: TodayViewProps) {
  const { content, prefs, isPro, completedLessonIds } = useStoic();

  const quote = useMemo(
    () => quoteForDayByOutcome(content.quotes, prefs.outcomes, new Date()),
    [content.quotes, prefs.outcomes],
  );
  const lesson = useMemo(
    () => lessonForDay(content.lessons, isPro, new Date()),
    [content.lessons, isPro],
  );
  const lessonDone = lesson ? completedLessonIds.includes(lesson.id) : false;

  return (
    <div className="px-5 pt-[calc(16px+var(--safe-top))] pb-28">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/35">{BRAND.appName}</p>
          <h1 className="mt-1 font-serif text-2xl text-white">{greeting()}.</h1>
        </div>
        <StreakBadge />
      </div>

      <section className="mt-6">
        <p className="mb-2 text-xs tracking-[0.2em] uppercase text-white/35">Today’s quote</p>
        <QuoteCard quote={quote} hero onReflect={onReflect} />
      </section>

      {lesson && (
        <section className="mt-6">
          <p className="mb-2 text-xs tracking-[0.2em] uppercase text-white/35">Today’s lesson</p>
          <button
            onClick={() => onOpenLesson(lesson)}
            className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">
                {lesson.track === 'calm' ? 'Calm under pressure' : 'Discipline & follow-through'}
              </span>
              {lessonDone && <span className="text-xs text-emerald-400/80">Done ✓</span>}
            </div>
            <h3 className="mt-2 font-serif text-lg text-white">{lesson.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/50">{lesson.body}</p>
          </button>
        </section>
      )}

      <section className="mt-6">
        <button
          onClick={onJournal}
          className="w-full rounded-3xl border border-dashed border-white/15 p-5 text-left text-white/70"
        >
          <span className="font-medium text-white">Journal a line</span>
          <p className="mt-1 text-sm text-white/45">One honest sentence keeps the streak alive.</p>
        </button>
      </section>
    </div>
  );
}
