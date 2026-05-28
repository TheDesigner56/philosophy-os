import { Lesson, PromptPack, Quote } from '@/types';
import { QUOTES } from '@/data/quotes';
import { LESSONS } from '@/data/lessons';
import { PROMPT_PACKS } from '@/data/prompts';

// Content is versioned so a remote update can't break older clients: a client
// only adopts remote content whose version it understands (<= its own).
export const CONTENT_VERSION = 1;

export interface ContentBundle {
  version: number;
  quotes: Quote[];
  lessons: Lesson[];
  promptPacks: PromptPack[];
}

export const BUNDLED_CONTENT: ContentBundle = {
  version: CONTENT_VERSION,
  quotes: QUOTES,
  lessons: LESSONS,
  promptPacks: PROMPT_PACKS,
};

/** Minimal structural validation — reject anything that would break the UI. */
export function isValidContent(value: unknown): value is ContentBundle {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<ContentBundle>;
  if (typeof c.version !== 'number') return false;
  if (!Array.isArray(c.quotes) || c.quotes.length === 0) return false;
  if (!Array.isArray(c.lessons) || !Array.isArray(c.promptPacks)) return false;
  return c.quotes.every((q) => q && typeof q.text === 'string' && typeof q.author === 'string');
}

/**
 * Daily content pull with bundled fallback. Tries the remote source; on any
 * failure, invalid shape, or a too-new version, returns the bundled content.
 */
export async function loadContent(opts: {
  remoteUrl?: string;
  fetcher?: typeof fetch;
} = {}): Promise<ContentBundle> {
  const { remoteUrl, fetcher = typeof fetch !== 'undefined' ? fetch : undefined } = opts;
  if (!remoteUrl || !fetcher) return BUNDLED_CONTENT;
  try {
    const res = await fetcher(remoteUrl, { cache: 'no-store' });
    if (!res.ok) return BUNDLED_CONTENT;
    const data: unknown = await res.json();
    if (isValidContent(data) && data.version <= CONTENT_VERSION) return data;
    return BUNDLED_CONTENT;
  } catch {
    return BUNDLED_CONTENT;
  }
}
