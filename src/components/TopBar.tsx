'use client';

import { Node, Category, CATEGORIES, CATEGORY_ORDER, ViewMode } from '@/types';

interface TopBarProps {
  nodes: Node[];
  connectionCount: number;
  viewMode: ViewMode;
  searchQuery: string;
  onViewModeChange: (m: ViewMode) => void;
  onSearchChange: (q: string) => void;
  onAddClick: () => void;
}

export default function TopBar({
  nodes,
  connectionCount,
  viewMode,
  searchQuery,
  onViewModeChange,
  onSearchChange,
  onAddClick,
}: TopBarProps) {
  const byCategory = CATEGORY_ORDER.reduce<Record<Category, number>>(
    (acc, c) => {
      acc[c] = nodes.filter((n) => n.category === c).length;
      return acc;
    },
    { form: 0, goal: 0, problem: 0, thought: 0, shadow: 0 }
  );

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-[#0A0A0A]/85 backdrop-blur">
      {/* Brand */}
      <div className="flex flex-col leading-none mr-1 shrink-0">
        <span className="text-white text-xs tracking-[0.28em] font-light">ΦΙΛΟΣΟΦΙΑ</span>
        <span className="text-white/30 text-[9px] tracking-[0.3em] uppercase mt-0.5">
          Philosophy OS
        </span>
      </div>

      {/* Stats */}
      <div className="hidden lg:flex items-center gap-3 text-[10px] text-white/30 ml-1">
        <span>{nodes.length} nodes</span>
        <span className="text-white/15">·</span>
        <span>{connectionCount} links</span>
        <span className="text-white/15">·</span>
        {CATEGORY_ORDER.map((c) => (
          <span key={c} title={CATEGORIES[c].name}>
            <span className="text-white/50">{byCategory[c]}</span>
            <span className="text-white/20 ml-0.5">{CATEGORIES[c].name.charAt(0).toLowerCase()}</span>
          </span>
        ))}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="search..."
          className="bg-white/5 border border-white/10 text-white/80 text-xs pl-7 pr-6 py-1.5 rounded focus:outline-none focus:border-white/25 placeholder-white/20 w-36 md:w-48"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-base leading-none"
            aria-label="clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="flex border border-white/10 rounded overflow-hidden">
        <button
          onClick={() => onViewModeChange('canvas')}
          className={`text-[10px] tracking-[0.12em] uppercase px-2.5 py-1.5 transition-colors ${
            viewMode === 'canvas'
              ? 'bg-white/10 text-white/85'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          Canvas
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`text-[10px] tracking-[0.12em] uppercase px-2.5 py-1.5 transition-colors ${
            viewMode === 'list'
              ? 'bg-white/10 text-white/85'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          List
        </button>
      </div>

      {/* Add */}
      <button
        onClick={onAddClick}
        className="w-8 h-8 rounded border border-white/20 hover:border-white/50 text-white/60 hover:text-white flex items-center justify-center text-lg leading-none transition-colors shrink-0"
        title="Add node (+)"
      >
        +
      </button>
    </div>
  );
}
