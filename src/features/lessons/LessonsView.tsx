'use client';

import { Lesson } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import { canReadLesson } from '@/lib/entitlement';

interface LessonsViewProps {
  onOpenLesson: (lesson: Lesson) => void;
  onUpgrade: (source: string) => void;
}

export default function LessonsView({ onOpenLesson, onUpgrade }: LessonsViewProps) {
  const { content, isPro, completedLessonIds } = useStoic();

  return (
    <div className="px-5 pt-[calc(16px+var(--safe-top))] pb-28">
      <h1 className="font-serif text-2xl text-white">Lessons</h1>
      <p className="mt-1 text-sm text-white/45">One concept. One action. 60 seconds.</p>

      <ul className="mt-5 space-y-3">
        {content.lessons.map((lesson) => {
          const unlocked = canReadLesson(lesson.free, isPro);
          const done = completedLessonIds.includes(lesson.id);
          return (
            <li key={lesson.id}>
              <button
                onClick={() => (unlocked ? onOpenLesson(lesson) : onUpgrade('lesson'))}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-white/40">
                    {lesson.track}
                  </span>
                  {done ? (
                    <span className="text-xs text-emerald-400/80">Done ✓</span>
                  ) : unlocked ? null : (
                    <span className="text-xs text-white/40">🔒</span>
                  )}
                </div>
                <h3 className="mt-1.5 font-medium text-white">{lesson.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{lesson.body}</p>
              </button>
            </li>
          );
        })}
      </ul>

      {!isPro && (
        <button
          onClick={() => onUpgrade('lessons_footer')}
          className="mt-5 w-full rounded-full border border-white/15 py-3 text-sm font-medium text-white/80 touch-target"
        >
          Unlock the full library + daily drip
        </button>
      )}
    </div>
  );
}
