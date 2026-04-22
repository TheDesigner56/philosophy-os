import { describe, it, expect } from 'vitest';
import { CATEGORIES, CATEGORY_ORDER, type Category } from '@/types';

describe('CATEGORIES', () => {
  it('defines exactly five categories', () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(5);
  });

  it('CATEGORY_ORDER has exactly five entries', () => {
    expect(CATEGORY_ORDER).toHaveLength(5);
  });

  it('CATEGORY_ORDER matches CATEGORIES keys', () => {
    for (const c of CATEGORY_ORDER) {
      expect(CATEGORIES).toHaveProperty(c);
    }
  });

  it('each category has required numeric fields > 0', () => {
    for (const cat of CATEGORY_ORDER) {
      const m = CATEGORIES[cat];
      expect(typeof m.radius).toBe('number');
      expect(m.radius).toBeGreaterThan(0);
      expect(typeof m.order).toBe('number');
    }
  });

  it('each category has non-empty string fields', () => {
    for (const cat of CATEGORY_ORDER) {
      const m = CATEGORIES[cat];
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.fill.length).toBeGreaterThan(0);
      expect(m.stroke.length).toBeGreaterThan(0);
      expect(m.text.length).toBeGreaterThan(0);
    }
  });

  it('only form has glow enabled', () => {
    expect(CATEGORIES.form.glow).toBe(true);
    for (const cat of ['goal', 'problem', 'thought', 'shadow'] as Category[]) {
      expect(CATEGORIES[cat].glow).toBe(false);
    }
  });

  it('form has the largest radius', () => {
    const radii = CATEGORY_ORDER.map((c) => CATEGORIES[c].radius);
    expect(CATEGORIES.form.radius).toBe(Math.max(...radii));
  });

  it('shadow has the smallest radius', () => {
    const radii = CATEGORY_ORDER.map((c) => CATEGORIES[c].radius);
    expect(CATEGORIES.shadow.radius).toBe(Math.min(...radii));
  });

  it('orders are 0 through 4 in sequence', () => {
    const orders = CATEGORY_ORDER.map((c) => CATEGORIES[c].order);
    expect(orders).toEqual([0, 1, 2, 3, 4]);
  });

  it('order matches position in CATEGORY_ORDER', () => {
    CATEGORY_ORDER.forEach((c, idx) => {
      expect(CATEGORIES[c].order).toBe(idx);
    });
  });

  it('category key property matches the record key', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORIES[cat].key).toBe(cat);
    }
  });
});
