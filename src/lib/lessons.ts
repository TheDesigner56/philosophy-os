import { Lesson, Track } from '@/types';
import { dailyIndex } from './daily';

/** The daily lesson drip. Pro draws from the full library; free from the
 *  starter set. Deterministic per day. */
export function lessonForDay(lessons: Lesson[], isPro: boolean, date: Date = new Date()): Lesson | null {
  const pool = isPro ? lessons : lessons.filter((l) => l.free);
  if (pool.length === 0) return null;
  return pool[dailyIndex(pool.length, date, 'lesson')];
}

export function lessonsForTrack(lessons: Lesson[], track: Track): Lesson[] {
  return lessons.filter((l) => l.track === track);
}
