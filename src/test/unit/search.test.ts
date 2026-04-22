import { describe, it, expect } from 'vitest';
import type { Node } from '@/types';
import { EXAMPLE_NODES } from '@/data/examples';

// Mirror the filter logic from ListView.tsx
function filterNodes(nodes: Node[], query: string): Node[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  return nodes.filter(
    (n) => n.label.toLowerCase().includes(q) || n.notes.toLowerCase().includes(q)
  );
}

describe('search / filter logic', () => {
  it('returns all nodes for empty query', () => {
    expect(filterNodes(EXAMPLE_NODES, '')).toHaveLength(EXAMPLE_NODES.length);
  });

  it('returns all nodes for whitespace-only query', () => {
    expect(filterNodes(EXAMPLE_NODES, '   ')).toHaveLength(EXAMPLE_NODES.length);
  });

  it('filters by label (case-insensitive, lower)', () => {
    const result = filterNodes(EXAMPLE_NODES, 'live');
    expect(result.some((n) => n.label.toLowerCase().includes('live'))).toBe(true);
  });

  it('filters by label (case-insensitive, upper)', () => {
    const result = filterNodes(EXAMPLE_NODES, 'LIVE');
    expect(result.some((n) => n.label.toLowerCase().includes('live'))).toBe(true);
  });

  it('filters by notes content', () => {
    // "Master my craft" notes: "Deep expertise compounds over time."
    const result = filterNodes(EXAMPLE_NODES, 'compound');
    expect(result.some((n) => n.label === 'Master my craft')).toBe(true);
  });

  it('returns empty array for no matches', () => {
    expect(filterNodes(EXAMPLE_NODES, 'xyznotfoundever')).toHaveLength(0);
  });

  it('trims whitespace around query', () => {
    const withSpaces = filterNodes(EXAMPLE_NODES, '  live  ');
    const trimmed = filterNodes(EXAMPLE_NODES, 'live');
    expect(withSpaces).toEqual(trimmed);
  });

  it('partial label match works', () => {
    const result = filterNodes(EXAMPLE_NODES, 'freedom');
    expect(result.some((n) => n.label === 'Financial freedom')).toBe(true);
  });

  it('partial notes match works', () => {
    const result = filterNodes(EXAMPLE_NODES, 'non-renewable');
    expect(result.some((n) => n.label === 'Protect my time')).toBe(true);
  });

  it('multiple nodes can match', () => {
    // Both "form" nodes have "deliberately" and "Protect" — search for general term
    const result = filterNodes(EXAMPLE_NODES, 'time');
    expect(result.length).toBeGreaterThan(1);
  });
});
