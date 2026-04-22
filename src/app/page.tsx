'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Node, Connection, Category, ViewMode, PhilosophyState } from '@/types';
import { EXAMPLE_STATE } from '@/data/examples';
import Canvas from '@/components/Canvas';
import DetailPanel from '@/components/DetailPanel';
import AddPanel from '@/components/AddPanel';
import TopBar from '@/components/TopBar';
import ListView from '@/components/ListView';

const STORAGE_KEY = 'philosophy-os:v1';
const makeId = () => Math.random().toString(36).slice(2, 10);

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [pendingConnectionFrom, setPendingConnectionFrom] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PhilosophyState>;
        if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
          setNodes(parsed.nodes);
          setConnections(parsed.connections);
          setHydrated(true);
          return;
        }
      }
    } catch {
      // ignore and seed
    }
    setNodes(EXAMPLE_STATE.nodes);
    setConnections(EXAMPLE_STATE.connections);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections }));
    } catch {
      // quota — ignore
    }
  }, [nodes, connections, hydrated]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const handleConnect = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setConnections((prev) => {
      const exists = prev.some(
        (c) => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
      );
      if (exists) return prev;
      return [...prev, { id: `${fromId}__${toId}__${Date.now()}`, from: fromId, to: toId }];
    });
    setPendingConnectionFrom(null);
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const handleUpdate = useCallback((id: string, patch: Partial<Node>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    setSelectedNodeId(null);
  }, []);

  const handleAdd = useCallback((category: Category, label: string) => {
    const host = canvasHostRef.current;
    const w = host?.clientWidth ?? 1200;
    const h = host?.clientHeight ?? 800;
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 140;
    const newNode: Node = {
      id: makeId(),
      category,
      label,
      notes: '',
      x: w / 2 + Math.cos(angle) * dist,
      y: h / 2 + Math.sin(angle) * dist,
      createdAt: Date.now(),
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField =
        !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (inField) return;
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setShowAddPanel(true);
      } else if (e.key === 'Escape') {
        setShowAddPanel(false);
        setSelectedNodeId(null);
        setPendingConnectionFrom(null);
      } else if (e.key === 'c' && selectedNodeId) {
        setPendingConnectionFrom(selectedNodeId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedNodeId]);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] text-white/90 overflow-hidden">
      <TopBar
        nodes={nodes}
        connectionCount={connections.length}
        viewMode={viewMode}
        searchQuery={searchQuery}
        onViewModeChange={setViewMode}
        onSearchChange={setSearchQuery}
        onAddClick={() => setShowAddPanel(true)}
      />

      {viewMode === 'canvas' ? (
        <div ref={canvasHostRef} className="absolute inset-0 pt-12">
          <Canvas
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            searchQuery={searchQuery}
            pendingConnectionFrom={pendingConnectionFrom}
            onNodeSelect={handleSelect}
            onNodeMove={handleNodeMove}
            onConnect={handleConnect}
          />
        </div>
      ) : (
        <ListView
          nodes={nodes}
          connections={connections}
          searchQuery={searchQuery}
          onSelect={(id) => {
            setSelectedNodeId(id);
            setViewMode('canvas');
          }}
        />
      )}

      {selectedNode && viewMode === 'canvas' && (
        <DetailPanel
          node={selectedNode}
          allNodes={nodes}
          connections={connections}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setSelectedNodeId(null)}
          onNavigate={(id) => setSelectedNodeId(id)}
        />
      )}

      {showAddPanel && (
        <AddPanel onAdd={handleAdd} onClose={() => setShowAddPanel(false)} />
      )}

      {pendingConnectionFrom && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#111] border border-white/15 text-white/70 text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded">
          Connect mode · click another node · esc to cancel
        </div>
      )}
    </div>
  );
}
