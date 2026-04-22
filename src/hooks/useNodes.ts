'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Category, Connection, Node } from '@/types';
import { EXAMPLE_STATE } from '@/data/examples';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'philosophy-os:v1';
const POSITION_DEBOUNCE_MS = 500;

type DbNode = {
  id: string;
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
};

function dbToNode(row: DbNode): Node {
  return {
    id: row.id,
    category: row.category as Category,
    label: row.text,
    notes: row.notes,
    x: row.x,
    y: row.y,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function dbToConn(row: DbConnection): Connection {
  return { id: row.id, from: row.from_node_id, to: row.to_node_id };
}

export function useNodes() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // Ref so mutation callbacks always see the latest value without re-creating
  const supAvailable = useRef(false);
  const moveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    async function load() {
      try {
        const [{ data: nodeRows, error: ne }, { data: connRows, error: ce }] =
          await Promise.all([
            supabase.from('nodes').select('*').order('created_at'),
            supabase.from('connections').select('*'),
          ]);

        if (!ne && !ce) {
          supAvailable.current = true;
          if (nodeRows && nodeRows.length > 0) {
            setNodes((nodeRows as DbNode[]).map(dbToNode));
            setConnections(((connRows ?? []) as DbConnection[]).map(dbToConn));
            setHydrated(true);
            return;
          }
          // Supabase reachable but empty — fall through to localStorage seed
        }
      } catch {
        // Network error — fall through to localStorage
      }

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<{ nodes: Node[]; connections: Connection[] }>;
          if (Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
            setNodes(parsed.nodes);
            setConnections(parsed.connections);
            setHydrated(true);
            return;
          }
        }
      } catch {
        // ignore
      }

      setNodes(EXAMPLE_STATE.nodes);
      setConnections(EXAMPLE_STATE.connections);
      setHydrated(true);
    }

    load();
  }, []);

  // Keep localStorage as offline backup regardless of Supabase status
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections }));
    } catch {
      // quota — ignore
    }
  }, [nodes, connections, hydrated]);

  const addNode = useCallback(async (node: Node) => {
    setNodes((prev) => [...prev, node]);
    if (!supAvailable.current) return;
    await supabase.from('nodes').insert({
      id: node.id,
      text: node.label,
      category: node.category,
      notes: node.notes,
      x: node.x,
      y: node.y,
    });
  }, []);

  const updateNode = useCallback(async (id: string, patch: Partial<Node>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    if (!supAvailable.current) return;
    const dbPatch: Record<string, unknown> = {};
    if (patch.label !== undefined) dbPatch.text = patch.label;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (Object.keys(dbPatch).length > 0) {
      await supabase.from('nodes').update(dbPatch).eq('id', id);
    }
  }, []);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
    if (!supAvailable.current) return;
    const existing = moveTimers.current.get(id);
    if (existing) clearTimeout(existing);
    const t = setTimeout(async () => {
      await supabase.from('nodes').update({ x, y }).eq('id', id);
      moveTimers.current.delete(id);
    }, POSITION_DEBOUNCE_MS);
    moveTimers.current.set(id, t);
  }, []);

  const deleteNode = useCallback(async (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    if (!supAvailable.current) return;
    await supabase.from('nodes').delete().eq('id', id);
  }, []);

  const addConnection = useCallback(async (conn: Connection) => {
    setConnections((prev) => {
      const exists = prev.some(
        (c) =>
          (c.from === conn.from && c.to === conn.to) ||
          (c.from === conn.to && c.to === conn.from),
      );
      if (exists) return prev;
      return [...prev, conn];
    });
    if (!supAvailable.current) return;
    await supabase
      .from('connections')
      .upsert(
        { id: conn.id, from_node_id: conn.from, to_node_id: conn.to },
        { ignoreDuplicates: true },
      );
  }, []);

  return { nodes, connections, hydrated, addNode, updateNode, moveNode, deleteNode, addConnection };
}
