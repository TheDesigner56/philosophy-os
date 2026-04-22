'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Node, Category, ViewMode } from '@/types';
import { useNodes } from '@/hooks/useNodes';
import Canvas from '@/components/Canvas';
import DetailPanel from '@/components/DetailPanel';
import AddPanel from '@/components/AddPanel';
import TopBar from '@/components/TopBar';
import ListView from '@/components/ListView';

export default function Home() {
  const { nodes, connections, hydrated, addNode, updateNode, moveNode, deleteNode, addConnection } = useNodes();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [pendingConnectionFrom, setPendingConnectionFrom] = useState<string | null>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    moveNode(id, x, y);
  }, [moveNode]);

  const handleConnect = useCallback((fromId: string, toId: string) => {
    addConnection(fromId, toId);
    setPendingConnectionFrom(null);
  }, [addConnection]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const handleUpdate = useCallback((id: string, patch: Partial<Node>) => {
    updateNode(id, patch);
  }, [updateNode]);

  const handleDelete = useCallback((id: string) => {
    deleteNode(id);
    setSelectedNodeId(null);
  }, [deleteNode]);

  const handleAdd = useCallback((category: Category, label: string) => {
    const host = canvasHostRef.current;
    const w = host?.clientWidth ?? 1200;
    const h = host?.clientHeight ?? 800;
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 140;
    const x = w / 2 + Math.cos(angle) * dist;
    const y = h / 2 + Math.sin(angle) * dist;
    addNode(category, label, x, y);
  }, [addNode]);

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

  if (!hydrated) return null;

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
