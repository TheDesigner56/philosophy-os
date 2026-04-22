'use client';

import { useState } from 'react';
import { Node, Connection, Category, CATEGORIES, CATEGORY_ORDER } from '@/types';

interface DetailPanelProps {
  node: Node;
  allNodes: Node[];
  connections: Connection[];
  onUpdate: (id: string, patch: Partial<Node>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function DetailPanel({
  node,
  allNodes,
  connections,
  onUpdate,
  onDelete,
  onClose,
  onNavigate,
}: DetailPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const connectedIds = connections
    .filter((c) => c.from === node.id || c.to === node.id)
    .map((c) => (c.from === node.id ? c.to : c.from));
  const connectedNodes = allNodes.filter((n) => connectedIds.includes(n.id));

  const createdDate = new Date(node.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(node.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
            {CATEGORIES[node.category].name}
          </span>
          <h2 className="text-white/95 text-base font-medium mt-1 leading-snug">{node.label}</h2>
          <span className="text-[10px] text-white/25">{createdDate}</span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors ml-2 shrink-0"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">Category</label>
        <select
          value={node.category}
          onChange={(e) => onUpdate(node.id, { category: e.target.value as Category })}
          className="w-full bg-white/5 border border-white/10 text-white/80 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-white/30 min-h-[44px]"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>{CATEGORIES[c].name}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">Title</label>
        <input
          type="text"
          value={node.label}
          onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          className="w-full bg-white/5 border border-white/10 text-white/90 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-white/30 min-h-[44px]"
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">Notes</label>
        <textarea
          value={node.notes}
          onChange={(e) => onUpdate(node.id, { notes: e.target.value })}
          placeholder="Add your thoughts..."
          className="w-full bg-white/5 border border-white/10 text-white/70 text-sm px-3 py-2.5 rounded-lg resize-none focus:outline-none focus:border-white/30 placeholder-white/20 min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Connected nodes — horizontal scroll chips */}
      {connectedNodes.length > 0 && (
        <div className="mb-4">
          <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">
            Connections ({connectedNodes.length})
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {connectedNodes.map((cn) => (
              <button
                key={cn.id}
                onClick={() => onNavigate(cn.id)}
                className="shrink-0 flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/[0.15] rounded-full px-3 py-2 text-xs text-white/60 hover:text-white/90 transition-colors min-h-[36px]"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORIES[cn.category].fill }}
                />
                <span className="truncate max-w-[110px]">{cn.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="pt-2 border-t border-white/10">
        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 min-h-[44px] text-sm text-white/50 border border-white/10 rounded-lg transition-colors hover:border-white/25"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 min-h-[44px] text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg transition-colors hover:bg-red-500/20"
            >
              Confirm delete
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="w-full min-h-[44px] text-sm text-white/30 hover:text-white/60 border border-white/10 hover:border-white/20 rounded-lg transition-colors"
          >
            Delete node
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: bottom sheet ────────────────────────────────────────────── */}
      <div className="md:hidden">
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-enter"
          onClick={onClose}
        />
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 sheet-enter bg-[#111111] rounded-t-2xl border-t border-white/10 shadow-2xl overflow-y-auto pb-safe ${
            isExpanded ? 'top-16' : 'max-h-[78vh]'
          }`}
        >
          {/* Handle — tap to toggle half/full */}
          <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-[#111111] z-10">
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="w-12 h-5 flex items-center justify-center"
              aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </button>
          </div>
          <div className="px-4 pt-2 pb-6">{panelContent}</div>
        </div>
      </div>

      {/* ── Desktop: right sidebar ──────────────────────────────────────────── */}
      <div className="hidden md:flex absolute right-0 top-0 h-full w-72 bg-[#111111] border-l border-white/10 flex-col z-20 overflow-y-auto">
        <div className="p-4">{panelContent}</div>
      </div>
    </>
  );
}
