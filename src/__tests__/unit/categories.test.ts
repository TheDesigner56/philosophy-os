import { describe, it, expect } from 'vitest';
import { CATEGORIES, CATEGORY_ORDER, type Category, type CategoryMeta } from '@/types';

describe('CATEGORY_ORDER', () => {
  it('has exactly 5 entries', () => {
    expect(CATEGORY_ORDER).toHaveLength(5);
  });

  it('contains every category key', () => {
    const keys: Category[] = ['form', 'goal', 'problem', 'thought', 'shadow'];
    expect(CATEGORY_ORDER).toEqual(expect.arrayContaining(keys));
  });

  it('starts with form and ends with shadow', () => {
    expect(CATEGORY_ORDER[0]).toBe('form');
    expect(CATEGORY_ORDER[CATEGORY_ORDER.length - 1]).toBe('shadow');
  });
});

describe('CATEGORIES', () => {
  it('has an entry for every category in CATEGORY_ORDER', () => {
    for (const key of CATEGORY_ORDER) {
      expect(CATEGORIES).toHaveProperty(key);
    }
  });

  it('each entry has required shape', () => {
    const required: (keyof CategoryMeta)[] = ['key', 'name', 'radius', 'fill', 'stroke', 'text', 'glow', 'order'];
    for (const [key, meta] of Object.entries(CATEGORIES)) {
      for (const field of required) {
        expect(meta, `${key}.${field}`).toHaveProperty(field);
      }
    }
  });

  it('key field matches the object key', () => {
    for (const [key, meta] of Object.entries(CATEGORIES)) {
      expect(meta.key).toBe(key);
    }
  });

  it('order values match CATEGORY_ORDER position', () => {
    for (let i = 0; i < CATEGORY_ORDER.length; i++) {
      expect(CATEGORIES[CATEGORY_ORDER[i]].order).toBe(i);
    }
  });

  it('radii decrease from form to shadow', () => {
    const radii = CATEGORY_ORDER.map((c) => CATEGORIES[c].radius);
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeLessThanOrEqual(radii[i - 1]);
    }
  });

  it('fill and stroke are non-empty hex-like strings', () => {
    for (const meta of Object.values(CATEGORIES)) {
      expect(meta.fill).toMatch(/^#[0-9A-Fa-f]{3,6}$/);
      expect(meta.stroke).toMatch(/^#[0-9A-Fa-f]{3,6}$/);
    }
  });
});
