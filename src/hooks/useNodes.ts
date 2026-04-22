'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Node, Connection, Category } from '@/types';
import { EXAMPLE_STATE } from '@/data/examples';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'philosophy-os:v1';
const USER_ID = 'default';
const MOVE_DEBOUNCE_MS = 400;

// ── DB row ↔ app type adapters ──────────────────────────────────────────────

type DbNode = {
  id: string;
  user_id: string;
  text: string;
  category: string;
  notes: string;
  x: number;
  y: number;
  created_at: string;
};

type DbConnection = {
  id: string;
  from_node_id: string;
  to_node_id: string;
  user_id: string;
};

function dbToNode(r: DbNode): Node {
  return {
    id: r.id,
    category: r.category as Node['category'],
    label: r.text,
    notes: r.notes ?? '',
    x: r.x,
    y: r.y,
    createdAt: new Date(r.created_at).getTime(),
  };
}

function nodeToDb(n: Node): Omit<DbNode, 'created_at'> {
  return { id: n.id, user_id: USER_ID, text: n.label, category: n.category, notes: n.notes, x: n.x, y: n.y };
}

function dbToConnection(r: DbConnection): Connection {
  return { id: r.id, from: r.from_node_id, to: r.to_node_id };
}

// ── localStorage helpers ─────────────────────────────────────────────────────

function lsRead(): { nodes: Node[]; connections: Connection[] } | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.nodes) && Array.isArray(parsed?.connections)) return parsed;
  } catch { /* ignore */ }
  return null;
}

function lsWrite(nodes: Node[], connections: Connection[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections }));
  } catch { /* quota */ }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface UseNodesReturn {
  nodes: Node[];
  connections: Connection[];
  hydrated: boolean;
  addNode: (category: Category, label: string, x: number, y: number) => void;
  updateNode: (id: string, patch: Partial<Node>) => void;
  moveNode: (id: string, x: number, y: number) => void;
  deleteNode: (id: string) => void;
  addConnection: (fromId: string, toId: string) => void;
}

export function useNodes(): UseNodesReturn {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // pending debounced position writes: nodeId → {x, y}
  const pendingMoves = useRef<Map<string, { x: number; y: number }>>(new Map());
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      // Try Supabase first
      try {
        const [{ data: dbNodes, error: ne }, { data: dbConns, error: ce }] = await Promise.all([
          supabase.from('nodes').select('*').eq('user_id', USER_ID),
          supabase.from('connections').select('*').eq('user_id', USER_ID),
        ]);

        if (!ne && !ce && dbNodes && dbConns) {
          const n = (dbNodes as DbNode[]).map(dbToNode);
          const c = (dbNodes.length > 0 ? dbConns : []) as DbConnection[];
          setNodes(n);
          setConnections(c.map(dbToConnection));
          setHydrated(true);
          // keep localStorage in sync
          lsWrite(n, c.map(dbToConnection));
          return;
        }
      } catch { /* offline — fall through */ }

      // Fall back to localStorage
      const ls = lsRead();
      if (ls) {
        setNodes(ls.nodes);
        setConnections(ls.connections);
        setHydrated(true);
        return;
      }

      // Seed with examples
      setNodes(EXAMPLE_STATE.nodes);
      setConnections(EXAMPLE_STATE.connections);
      setHydrated(true);
    }

    load();
  }, []);

  // ── Sync localStorage on every state change ─────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    lsWrite(nodes, connections);
  }, [nodes, connections, hydrated]);

  // ── Flush debounced moves to Supabase ────────────────────────────────────────
  function scheduleMoveFlush() {
    if (moveTimer.current) clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(async () => {
      const entries = Array.from(pendingMoves.current.entries());
      pendingMoves.current.clear();
      await Promise.all(
        entries.map(([id, { x, y }]) =>
          supabase.from('nodes').update({ x, y, updated_at: new Date().toISOString() }).eq('id', id)
        )
      );
    }, MOVE_DEBOUNCE_MS);
  }

  // ── Mutations ────────────────────────────────────────────────────────────────

  const addNode = useCallback((category: Category, label: string, x: number, y: number) => {
    const node: Node = {
      id: crypto.randomUUID(),
      category,
      label,
      notes: '',
      x,
      y,
      createdAt: Date.now(),
    };
    setNodes((prev) => [...prev, node]);
    supabase.from('nodes').insert(nodeToDb(node));
  }, []);

  const updateNode = useCallback((id: string, patch: Partial<Node>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    const dbPatch: Record<string, unknown> = {};
    if (patch.label !== undefined) dbPatch.text = patch.label;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.x !== undefined) dbPatch.x = patch.x;
    if (patch.y !== undefined) dbPatch.y = patch.y;
    if (Object.keys(dbPatch).length > 0) {
      dbPatch.updated_at = new Date().toISOString();
      supabase.from('nodes').update(dbPatch).eq('id', id);
    }
  }, []);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
    pendingMoves.current.set(id, { x, y });
    scheduleMoveFlush();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    supabase.from('nodes').delete().eq('id', id);
  }, []);

  const addConnection = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setConnections((prev) => {
      const exists = prev.some(
        (c) => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
      );
      if (exists) return prev;
      const conn: Connection = { id: crypto.randomUUID(), from: fromId, to: toId };
      supabase.from('connections').insert({ id: conn.id, from_node_id: fromId, to_node_id: toId, user_id: USER_ID });
      return [...prev, conn];
    });
  }, []);

  return { nodes, connections, hydrated, addNode, updateNode, moveNode, deleteNode, addConnection };
}
