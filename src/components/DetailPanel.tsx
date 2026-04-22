'use client';

import { useState } from 'react';
import { Node, Connection, Category, CATEGORIES, CATEGORY_ORDER } from '@/types';
import BottomSheet from './BottomSheet';
import DeleteConfirm from './DeleteConfirm';

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const connectedIds = connections
    .filter((c) => c.from === node.id || c.to === node.id)
    .map((c) => (c.from === node.id ? c.to : c.from));
  const connectedNodes = allNodes.filter((n) => connectedIds.includes(n.id));

  const createdDate = new Date(node.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const requestDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    setConfirmOpen(false);
    onDelete(node.id);
  };

  const body = (
    <div className="flex flex-col">
      <div className="px-5 pt-3 pb-4 border-b border-white/10">
        <span className="text-[10px] tracking-[0.28em] text-white/45 uppercase">
          {CATEGORIES[node.category].name}
        </span>
        <h2 className="text-white text-xl md:text-lg font-light mt-1.5 leading-snug tracking-tight">
          {node.label}
        </h2>
        <span className="text-[10px] text-white/25 mt-1 block tracking-wide">{createdDate}</span>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div>
          <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
            Category
          </label>
          <select
            value={node.category}
            onChange={(e) => onUpdate(node.id, { category: e.target.value as Category })}
            className="w-full bg-[#1a1a1a] border border-white/10 text-white/85 text-sm md:text-xs px-3 py-3 md:py-2 rounded focus:outline-none focus:border-white/30 min-h-[44px] md:min-h-0"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORIES[c].name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
            Title
          </label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm md:text-xs px-3 py-3 md:py-2 rounded focus:outline-none focus:border-white/30 min-h-[44px] md:min-h-0"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
            Notes
          </label>
          <textarea
            value={node.notes}
            onChange={(e) => onUpdate(node.id, { notes: e.target.value })}
            placeholder="Add your thoughts..."
            rows={4}
            className="w-full bg-[#1a1a1a] border border-white/10 text-white/80 text-sm md:text-xs px-3 py-2.5 rounded resize-none focus:outline-none focus:border-white/30 placeholder-white/20 min-h-[110px] md:min-h-[90px]"
          />
        </div>

        {connectedNodes.length > 0 && (
          <div>
            <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
              Connections ({connectedNodes.length})
            </label>
            <div className="space-y-1.5 md:max-h-36 md:overflow-y-auto">
              {connectedNodes.map((cn) => (
                <button
                  key={cn.id}
                  onClick={() => onNavigate(cn.id)}
                  className="w-full text-left text-xs md:text-[11px] text-white/75 hover:text-white/95 bg-[#1a1a1a] hover:bg-[#222] active:bg-[#262626] border border-white/5 rounded-lg px-3 py-3 md:py-2 transition-colors flex items-center gap-2.5 min-h-[44px] md:min-h-0"
                >
                  <span className="text-[9px] text-white/30 shrink-0 uppercase tracking-[0.2em]">
                    {CATEGORIES[cn.category].name}
                  </span>
                  <span className="truncate">{cn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 pt-6 mt-2">
        <button
          onClick={requestDelete}
          className="w-full touch-target text-xs text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-lg transition-colors tracking-wide"
        >
          Delete node
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      <BottomSheet open onClose={onClose} ariaLabel="Node detail" keyId={node.id} maxHeightVh={88}>
        {body}
      </BottomSheet>

      {/* Desktop: right sidebar */}
      <div className="hidden md:flex absolute right-0 top-0 h-full w-80 bg-[#111111] border-l border-white/10 flex-col z-20 overflow-hidden view-enter">
        <div className="flex items-start justify-between px-5 pt-5 pb-0">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] tracking-[0.25em] text-white/45 uppercase">
              {CATEGORIES[node.category].name}
            </span>
            <h2 className="text-white text-base font-light mt-1 leading-snug tracking-tight">
              {node.label}
            </h2>
            <span className="text-[10px] text-white/25 tracking-wide">{createdDate}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors ml-2 mt-0.5 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="border-t border-white/10 mt-4" />
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
              Category
            </label>
            <select
              value={node.category}
              onChange={(e) => onUpdate(node.id, { category: e.target.value as Category })}
              className="w-full bg-[#1a1a1a] border border-white/10 text-white/85 text-xs px-3 py-2 rounded focus:outline-none focus:border-white/30"
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIES[c].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
              Title
            </label>
            <input
              type="text"
              value={node.label}
              onChange={(e) => onUpdate(node.id, { label: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
              Notes
            </label>
            <textarea
              value={node.notes}
              onChange={(e) => onUpdate(node.id, { notes: e.target.value })}
              placeholder="Add your thoughts..."
              className="w-full bg-[#1a1a1a] border border-white/10 text-white/80 text-xs px-3 py-2.5 rounded resize-none focus:outline-none focus:border-white/30 placeholder-white/20 min-h-[110px]"
            />
          </div>

          {connectedNodes.length > 0 && (
            <div>
              <label className="text-[10px] tracking-[0.2em] text-white/45 uppercase block mb-2">
                Connections ({connectedNodes.length})
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {connectedNodes.map((cn) => (
                  <button
                    key={cn.id}
                    onClick={() => onNavigate(cn.id)}
                    className="w-full text-left text-[11px] text-white/70 hover:text-white/95 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 rounded px-2.5 py-2 transition-colors flex items-center gap-2"
                  >
                    <span className="text-[9px] text-white/30 shrink-0 uppercase tracking-[0.2em]">
                      {CATEGORIES[cn.category].name}
                    </span>
                    <span className="truncate">{cn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/10">
          <button
            onClick={requestDelete}
            className="w-full text-xs text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded py-2 transition-colors tracking-wide"
          >
            Delete node
          </button>
        </div>
      </div>

      <DeleteConfirm
        open={confirmOpen}
        label={node.label}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
