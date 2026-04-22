'use client';

import { Node, Connection, CATEGORIES, CATEGORY_ORDER } from '@/types';

interface ListViewProps {
  nodes: Node[];
  connections: Connection[];
  searchQuery: string;
  onSelect: (id: string) => void;
}

export default function ListView({ nodes, connections, searchQuery, onSelect }: ListViewProps) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? nodes.filter(
        (n) => n.label.toLowerCase().includes(q) || n.notes.toLowerCase().includes(q)
      )
    : nodes;

  return (
    <div className="w-full h-full overflow-y-auto pt-20 pb-16 px-4 md:px-12 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto space-y-10">
        {CATEGORY_ORDER.map((cat) => {
          const items = filtered.filter((n) => n.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-white/70 text-[10px] tracking-[0.35em] uppercase">
                  {CATEGORIES[cat].name}
                </h2>
                <span className="text-white/25 text-[10px]">{items.length}</span>
              </div>
              <div className="border-t border-white/5">
                {items.map((n) => {
                  const linkCount = connections.filter(
                    (c) => c.from === n.id || c.to === n.id
                  ).length;
                  return (
                    <button
                      key={n.id}
                      onClick={() => onSelect(n.id)}
                      className="group w-full text-left py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors flex items-start gap-4 px-1"
                    >
                      <div
                        className="w-1 h-1 rounded-full mt-[7px] shrink-0 transition-colors"
                        style={{ backgroundColor: CATEGORIES[n.category].fill }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white/85 text-sm">{n.label}</div>
                        {n.notes && (
                          <div className="text-white/40 text-xs mt-1 line-clamp-2">{n.notes}</div>
                        )}
                        {linkCount > 0 && (
                          <div className="text-white/25 text-[10px] mt-1">
                            {linkCount} {linkCount === 1 ? 'link' : 'links'}
                          </div>
                        )}
                      </div>
                      <span className="text-white/20 text-xs mt-0.5 shrink-0 group-hover:text-white/50 transition-colors">
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-white/30 text-sm py-20">
            {q ? `No matches for "${searchQuery}"` : 'No nodes yet — add one to begin.'}
          </div>
        )}
      </div>
    </div>
  );
}
