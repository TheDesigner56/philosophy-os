import { describe, it, expect } from 'vitest';
import type { Connection } from '@/types';

// Mirror the logic from page.tsx handleConnect
function connectionExists(connections: Connection[], fromId: string, toId: string): boolean {
  return connections.some(
    (c) => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
  );
}

function makeConnection(from: string, to: string, ts = 0): Connection {
  return { id: `${from}__${to}__${ts}`, from, to };
}

function addConnection(connections: Connection[], fromId: string, toId: string): Connection[] {
  if (fromId === toId) return connections;
  if (connectionExists(connections, fromId, toId)) return connections;
  return [...connections, makeConnection(fromId, toId, Date.now())];
}

describe('connection logic', () => {
  it('generates correct connection id format', () => {
    const c = makeConnection('a', 'b', 42);
    expect(c.id).toBe('a__b__42');
    expect(c.from).toBe('a');
    expect(c.to).toBe('b');
  });

  it('detects existing forward connection', () => {
    const conns: Connection[] = [makeConnection('a', 'b')];
    expect(connectionExists(conns, 'a', 'b')).toBe(true);
  });

  it('detects existing reverse (bidirectional) connection', () => {
    const conns: Connection[] = [makeConnection('a', 'b')];
    expect(connectionExists(conns, 'b', 'a')).toBe(true);
  });

  it('returns false for non-existent connection', () => {
    const conns: Connection[] = [makeConnection('a', 'b')];
    expect(connectionExists(conns, 'a', 'c')).toBe(false);
    expect(connectionExists(conns, 'c', 'b')).toBe(false);
  });

  it('prevents self-connections', () => {
    const result = addConnection([], 'a', 'a');
    expect(result).toHaveLength(0);
  });

  it('prevents duplicate connections', () => {
    const start: Connection[] = [makeConnection('a', 'b')];
    const result = addConnection(start, 'a', 'b');
    expect(result).toHaveLength(1);
  });

  it('prevents duplicate in reverse direction', () => {
    const start: Connection[] = [makeConnection('a', 'b')];
    const result = addConnection(start, 'b', 'a');
    expect(result).toHaveLength(1);
  });

  it('adds a new unique connection', () => {
    const start: Connection[] = [makeConnection('a', 'b')];
    const result = addConnection(start, 'a', 'c');
    expect(result).toHaveLength(2);
    expect(result[1].from).toBe('a');
    expect(result[1].to).toBe('c');
  });

  it('returns empty array unchanged when empty', () => {
    expect(connectionExists([], 'a', 'b')).toBe(false);
  });

  it('getConnectedIds finds both directions', () => {
    const conns: Connection[] = [
      makeConnection('x', 'y'),
      makeConnection('z', 'x'),
    ];
    const connectedIds = conns
      .filter((c) => c.from === 'x' || c.to === 'x')
      .map((c) => (c.from === 'x' ? c.to : c.from));
    expect(connectedIds).toContain('y');
    expect(connectedIds).toContain('z');
  });
});
