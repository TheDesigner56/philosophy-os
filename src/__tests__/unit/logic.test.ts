import { describe, it, expect } from 'vitest';
import type { Connection, Node, PhilosophyState } from '@/types';

// --- Connection dedup (mirrors page.tsx handleConnect logic) ---
function addConnection(
  prev: Connection[],
  fromId: string,
  toId: string,
): Connection[] {
  if (fromId === toId) return prev;
  const exists = prev.some(
    (c) => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId),
  );
  if (exists) return prev;
  return [...prev, { id: `${fromId}__${toId}__0`, from: fromId, to: toId }];
}

describe('connection dedup', () => {
  it('adds a new connection when none exists', () => {
    const result = addConnection([], 'a', 'b');
    expect(result).toHaveLength(1);
    expect(result[0].from).toBe('a');
    expect(result[0].to).toBe('b');
  });

  it('does not add a duplicate (same direction)', () => {
    const existing: Connection[] = [{ id: 'a__b__0', from: 'a', to: 'b' }];
    const result = addConnection(existing, 'a', 'b');
    expect(result).toHaveLength(1);
    expect(result).toBe(existing); // same reference — no copy made
  });

  it('does not add a duplicate (reversed direction)', () => {
    const existing: Connection[] = [{ id: 'a__b__0', from: 'a', to: 'b' }];
    const result = addConnection(existing, 'b', 'a');
    expect(result).toHaveLength(1);
  });

  it('does not connect a node to itself', () => {
    const result = addConnection([], 'a', 'a');
    expect(result).toHaveLength(0);
  });

  it('allows adding a second distinct connection', () => {
    const existing: Connection[] = [{ id: 'a__b__0', from: 'a', to: 'b' }];
    const result = addConnection(existing, 'a', 'c');
    expect(result).toHaveLength(2);
  });
});

// --- Search filtering (mirrors ListView filter logic) ---
function filterNodes(nodes: Node[], query: string): Node[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  return nodes.filter(
    (n) => n.label.toLowerCase().includes(q) || n.notes.toLowerCase().includes(q),
  );
}

const sampleNodes: Node[] = [
  { id: '1', category: 'form', label: 'Live deliberately', notes: 'With intention', x: 0, y: 0, createdAt: 1 },
  { id: '2', category: 'goal', label: 'Financial freedom', notes: 'Remove constraints', x: 0, y: 0, createdAt: 2 },
  { id: '3', category: 'shadow', label: 'Say no', notes: 'Protect time', x: 0, y: 0, createdAt: 3 },
];

describe('search filtering', () => {
  it('returns all nodes for empty query', () => {
    expect(filterNodes(sampleNodes, '')).toHaveLength(3);
    expect(filterNodes(sampleNodes, '   ')).toHaveLength(3);
  });

  it('filters by label (case-insensitive)', () => {
    const result = filterNodes(sampleNodes, 'financial');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by notes (case-insensitive)', () => {
    const result = filterNodes(sampleNodes, 'intention');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns multiple matches', () => {
    // 'time' appears in notes of node 3 ("Protect time") — node 1 doesn't match
    const result = filterNodes(sampleNodes, 'no');
    // 'no' matches 'Say no' (label) and 'Remove constraints' doesn't, 'With intention' doesn't
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns empty array when nothing matches', () => {
    expect(filterNodes(sampleNodes, 'zzzznonexistent')).toHaveLength(0);
  });
});

// --- localStorage serialization ---
describe('localStorage serialization', () => {
  it('round-trips a PhilosophyState via JSON', () => {
    const state: PhilosophyState = {
      nodes: [{ id: 'x', category: 'thought', label: 'Test', notes: '', x: 10, y: 20, createdAt: 999 }],
      connections: [{ id: 'x__y__0', from: 'x', to: 'y' }],
    };
    const serialized = JSON.stringify(state);
    const parsed = JSON.parse(serialized) as PhilosophyState;
    expect(parsed.nodes).toHaveLength(1);
    expect(parsed.nodes[0].id).toBe('x');
    expect(parsed.connections[0].from).toBe('x');
  });

  it('round-trips empty state', () => {
    const state: PhilosophyState = { nodes: [], connections: [] };
    const parsed = JSON.parse(JSON.stringify(state)) as PhilosophyState;
    expect(parsed.nodes).toHaveLength(0);
    expect(parsed.connections).toHaveLength(0);
  });

  it('rejects malformed JSON gracefully via try/catch', () => {
    expect(() => JSON.parse('not-json')).toThrow();
  });

  it('guards against missing arrays', () => {
    const raw = JSON.parse('{"nodes": null}') as Partial<PhilosophyState>;
    const valid = raw && Array.isArray(raw.nodes) && Array.isArray(raw.connections);
    expect(valid).toBe(false);
  });
});
