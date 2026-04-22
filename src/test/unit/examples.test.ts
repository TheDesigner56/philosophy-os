import { describe, it, expect } from 'vitest';
import { EXAMPLE_STATE, EXAMPLE_NODES, EXAMPLE_CONNECTIONS } from '@/data/examples';
import { CATEGORY_ORDER } from '@/types';

describe('EXAMPLE_STATE', () => {
  it('has at least 5 nodes', () => {
    expect(EXAMPLE_STATE.nodes.length).toBeGreaterThanOrEqual(5);
  });

  it('has at least 1 connection', () => {
    expect(EXAMPLE_STATE.connections.length).toBeGreaterThanOrEqual(1);
  });

  it('all node ids are unique', () => {
    const ids = EXAMPLE_STATE.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all connection ids are unique', () => {
    const ids = EXAMPLE_STATE.connections.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all connection node refs point to existing nodes', () => {
    const nodeIds = new Set(EXAMPLE_STATE.nodes.map((n) => n.id));
    for (const conn of EXAMPLE_STATE.connections) {
      expect(nodeIds.has(conn.from), `from ${conn.from} not found`).toBe(true);
      expect(nodeIds.has(conn.to), `to ${conn.to} not found`).toBe(true);
    }
  });

  it('each node has required fields with correct types', () => {
    for (const node of EXAMPLE_NODES) {
      expect(typeof node.id).toBe('string');
      expect(node.id.length).toBeGreaterThan(0);
      expect(typeof node.label).toBe('string');
      expect(node.label.length).toBeGreaterThan(0);
      expect(typeof node.notes).toBe('string');
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(typeof node.createdAt).toBe('number');
      expect(CATEGORY_ORDER).toContain(node.category);
    }
  });

  it('EXAMPLE_NODES is the same reference as EXAMPLE_STATE.nodes', () => {
    expect(EXAMPLE_NODES).toBe(EXAMPLE_STATE.nodes);
  });

  it('EXAMPLE_CONNECTIONS is the same reference as EXAMPLE_STATE.connections', () => {
    expect(EXAMPLE_CONNECTIONS).toBe(EXAMPLE_STATE.connections);
  });

  it('nodes have valid (positive) canvas positions', () => {
    for (const node of EXAMPLE_NODES) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.y).toBeGreaterThan(0);
    }
  });

  it('nodes span multiple categories', () => {
    const cats = new Set(EXAMPLE_NODES.map((n) => n.category));
    expect(cats.size).toBeGreaterThanOrEqual(3);
  });

  it('no connection links a node to itself', () => {
    for (const conn of EXAMPLE_CONNECTIONS) {
      expect(conn.from).not.toBe(conn.to);
    }
  });
});
