import { describe, it, expect } from 'vitest';
import { EXAMPLE_STATE, EXAMPLE_NODES, EXAMPLE_CONNECTIONS } from '@/data/examples';
import { CATEGORY_ORDER } from '@/types';

describe('EXAMPLE_NODES', () => {
  it('has at least one node', () => {
    expect(EXAMPLE_NODES.length).toBeGreaterThan(0);
  });

  it('every node has required fields', () => {
    for (const n of EXAMPLE_NODES) {
      expect(typeof n.id).toBe('string');
      expect(n.id.length).toBeGreaterThan(0);
      expect(CATEGORY_ORDER).toContain(n.category);
      expect(typeof n.label).toBe('string');
      expect(n.label.length).toBeGreaterThan(0);
      expect(typeof n.notes).toBe('string');
      expect(typeof n.x).toBe('number');
      expect(typeof n.y).toBe('number');
      expect(typeof n.createdAt).toBe('number');
    }
  });

  it('node IDs are unique', () => {
    const ids = EXAMPLE_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers multiple categories', () => {
    const cats = new Set(EXAMPLE_NODES.map((n) => n.category));
    expect(cats.size).toBeGreaterThan(1);
  });
});

describe('EXAMPLE_CONNECTIONS', () => {
  it('every connection references valid node IDs', () => {
    const nodeIds = new Set(EXAMPLE_NODES.map((n) => n.id));
    for (const c of EXAMPLE_CONNECTIONS) {
      expect(nodeIds.has(c.from), `from: ${c.from}`).toBe(true);
      expect(nodeIds.has(c.to), `to: ${c.to}`).toBe(true);
    }
  });

  it('no self-connections', () => {
    for (const c of EXAMPLE_CONNECTIONS) {
      expect(c.from).not.toBe(c.to);
    }
  });

  it('connection IDs are unique', () => {
    const ids = EXAMPLE_CONNECTIONS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('EXAMPLE_STATE', () => {
  it('nodes and connections arrays are the exported constants', () => {
    expect(EXAMPLE_STATE.nodes).toBe(EXAMPLE_NODES);
    expect(EXAMPLE_STATE.connections).toBe(EXAMPLE_CONNECTIONS);
  });
});
