'use client';

import { Lesson } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import Sheet from '@/components/Sheet';

interface LessonReaderProps {
  lesson: Lesson | null;
  onClose: () => void;
}

export default function LessonReader({ lesson, onClose }: LessonReaderProps) {
  const { completedLessonIds, completeLesson } = useStoic();
  const done = lesson ? completedLessonIds.includes(lesson.id) : false;

  return (
    <Sheet open={!!lesson} onClose={onClose} keyId={lesson?.id} ariaLabel="Lesson">
      {lesson && (
        <div className="px-5 pb-6 pt-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">
            {lesson.track === 'calm' ? 'Calm under pressure' : 'Discipline & follow-through'}
          </span>
          <h2 className="mt-2 font-serif text-2xl text-white">{lesson.title}</h2>
          <p className="mt-4 leading-relaxed text-white/75">{lesson.body}</p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">One action</p>
            <p className="mt-1.5 text-white/90">{lesson.action}</p>
          </div>

          <button
            onClick={() => {
              if (!done) completeLesson(lesson.id);
              onClose();
            }}
            className={`mt-6 w-full rounded-full py-3 font-medium touch-target ${
              done ? 'border border-white/20 text-white/70' : 'bg-white text-black'
            }`}
          >
            {done ? 'Completed ✓' : 'Mark complete'}
          </button>
        </div>
      )}
    </Sheet>
  );
}
