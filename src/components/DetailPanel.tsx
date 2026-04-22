'use client';

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
  const connectedIds = connections
    .filter((c) => c.from === node.id || c.to === node.id)
    .map((c) => (c.from === node.id ? c.to : c.from));
  const connectedNodes = allNodes.filter((n) => connectedIds.includes(n.id));

  const createdDate = new Date(node.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-[#111111] border-l border-white/10 flex flex-col z-20 overflow-hidden">
      <div className="flex items-start justify-between p-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
            {CATEGORIES[node.category].name}
          </span>
          <h2 className="text-white text-sm font-medium mt-1 leading-snug">{node.label}</h2>
          <span className="text-[10px] text-white/25">{createdDate}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/70 transition-colors ml-2 mt-0.5 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="px-4 pt-3">
        <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">Category</label>
        <select
          value={node.category}
          onChange={(e) => onUpdate(node.id, { category: e.target.value as Category })}
          className="w-full bg-[#1a1a1a] border border-white/10 text-white/80 text-xs px-3 py-2 rounded focus:outline-none focus:border-white/30"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORIES[c].name}
            </option>
          ))}
        </select>
      </div>

      <div className="px-4 pt-3">
        <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">Title</label>
        <input
          type="text"
          value={node.label}
          onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          className="w-full bg-[#1a1a1a] border border-white/10 text-white/90 text-xs px-3 py-2 rounded focus:outline-none focus:border-white/30"
        />
      </div>

      <div className="px-4 pt-3 flex-1 flex flex-col min-h-0">
        <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">Notes</label>
        <textarea
          value={node.notes}
          onChange={(e) => onUpdate(node.id, { notes: e.target.value })}
          placeholder="Add your thoughts..."
          className="flex-1 bg-[#1a1a1a] border border-white/10 text-white/70 text-xs px-3 py-2 rounded resize-none focus:outline-none focus:border-white/30 placeholder-white/20 min-h-[80px]"
        />
      </div>

      {connectedNodes.length > 0 && (
        <div className="px-4 pt-3">
          <label className="text-[10px] tracking-[0.15em] text-white/40 uppercase block mb-2">
            Connections ({connectedNodes.length})
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {connectedNodes.map((cn) => (
              <button
                key={cn.id}
                onClick={() => onNavigate(cn.id)}
                className="w-full text-left text-xs text-white/60 hover:text-white/90 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 rounded px-3 py-1.5 transition-colors flex items-center gap-2"
              >
                <span className="text-[10px] text-white/25 shrink-0 uppercase tracking-wider">
                  {CATEGORIES[cn.category].name}
                </span>
                <span className="truncate">{cn.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full text-xs text-white/30 hover:text-white/60 border border-white/10 hover:border-white/20 rounded py-2 transition-colors"
        >
          Delete node
        </button>
      </div>
    </div>
  );
}
