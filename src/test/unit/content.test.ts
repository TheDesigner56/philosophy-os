import { describe, it, expect } from 'vitest';
import {
  BUNDLED_CONTENT,
  CONTENT_VERSION,
  ContentBundle,
  isValidContent,
  loadContent,
} from '@/lib/content';
import { LESSONS } from '@/data/lessons';
import { PROMPT_PACKS } from '@/data/prompts';
import { QUOTES } from '@/data/quotes';

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

describe('bundled content integrity', () => {
  it('every quote has the required fields', () => {
    for (const q of QUOTES) {
      expect(q.id).toBeTruthy();
      expect(q.text.length).toBeGreaterThan(0);
      expect(q.author.length).toBeGreaterThan(0);
      expect(['calm', 'discipline', 'general']).toContain(q.theme);
    }
  });

  it('quote ids are unique', () => {
    expect(new Set(QUOTES.map((q) => q.id)).size).toBe(QUOTES.length);
  });

  it('ships exactly 3 free starter lessons', () => {
    expect(LESSONS.filter((l) => l.free)).toHaveLength(3);
  });

  it('every lesson has a body and an action', () => {
    for (const l of LESSONS) {
      expect(l.body.length).toBeGreaterThan(0);
      expect(l.action.length).toBeGreaterThan(0);
      expect(['calm', 'discipline']).toContain(l.track);
    }
  });

  it('ships exactly one free prompt pack (free-form)', () => {
    const free = PROMPT_PACKS.filter((p) => p.free);
    expect(free).toHaveLength(1);
    expect(free[0].id).toBe('free-form');
  });
});

describe('isValidContent', () => {
  it('accepts the bundled content', () => {
    expect(isValidContent(BUNDLED_CONTENT)).toBe(true);
  });

  it('rejects junk', () => {
    expect(isValidContent(null)).toBe(false);
    expect(isValidContent({})).toBe(false);
    expect(isValidContent({ version: 1, quotes: [], lessons: [], promptPacks: [] })).toBe(false);
    expect(isValidContent({ version: 1, quotes: [{ text: 1 }], lessons: [], promptPacks: [] })).toBe(false);
  });
});

describe('loadContent', () => {
  it('returns bundled content when no remote URL is configured', async () => {
    const c = await loadContent();
    expect(c).toBe(BUNDLED_CONTENT);
  });

  it('uses valid remote content', async () => {
    const remote: ContentBundle = { ...BUNDLED_CONTENT, version: CONTENT_VERSION };
    const c = await loadContent({
      remoteUrl: 'https://cdn.example/content.json',
      fetcher: async () => jsonResponse(remote),
    });
    expect(c.version).toBe(CONTENT_VERSION);
  });

  it('falls back to bundled on a non-ok response', async () => {
    const c = await loadContent({
      remoteUrl: 'https://cdn.example/content.json',
      fetcher: async () => jsonResponse({}, false),
    });
    expect(c).toBe(BUNDLED_CONTENT);
  });

  it('falls back to bundled when remote content is too new', async () => {
    const tooNew = { ...BUNDLED_CONTENT, version: CONTENT_VERSION + 1 };
    const c = await loadContent({
      remoteUrl: 'https://cdn.example/content.json',
      fetcher: async () => jsonResponse(tooNew),
    });
    expect(c).toBe(BUNDLED_CONTENT);
  });

  it('falls back to bundled when the fetch throws', async () => {
    const c = await loadContent({
      remoteUrl: 'https://cdn.example/content.json',
      fetcher: async () => {
        throw new Error('network');
      },
    });
    expect(c).toBe(BUNDLED_CONTENT);
  });
});
