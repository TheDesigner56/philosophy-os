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
    <div className="w-full h-full overflow-y-auto pt-16 md:pt-20 pb-24 px-5 md:px-12 bg-[#0A0A0A] view-enter">
      <div className="max-w-3xl mx-auto space-y-10 md:space-y-12">
        {CATEGORY_ORDER.map((cat) => {
          const items = filtered.filter((n) => n.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-baseline justify-between mb-3 md:mb-4">
                <h2 className="text-white/75 text-[11px] md:text-[10px] tracking-[0.35em] uppercase font-light">
                  {CATEGORIES[cat].name}
                </h2>
                <span className="text-white/25 text-[10px] tracking-wider">
                  {items.length}
                </span>
              </div>
              <ul className="border-t border-white/5">
                {items.map((n) => {
                  const linkCount = connections.filter(
                    (c) => c.from === n.id || c.to === n.id
                  ).length;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => onSelect(n.id)}
                        className="group w-full text-left py-3.5 md:py-3 border-b border-white/5 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors flex items-start gap-3.5 px-1 min-h-[44px]"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-[9px] md:mt-[7px] shrink-0"
                          style={{ backgroundColor: CATEGORIES[n.category].fill }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white/90 text-[15px] md:text-sm leading-snug">
                            {n.label}
                          </div>
                          {n.notes && (
                            <div className="text-white/45 text-[13px] md:text-xs mt-1 leading-snug line-clamp-2">
                              {n.notes}
                            </div>
                          )}
                          {linkCount > 0 && (
                            <div className="text-white/30 text-[10px] mt-1.5 tracking-wider uppercase">
                              {linkCount} {linkCount === 1 ? 'link' : 'links'}
                            </div>
                          )}
                        </div>
                        <span className="text-white/20 text-sm md:text-xs mt-0.5 shrink-0 group-hover:text-white/60 transition-colors">
                          →
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-white/40 text-sm py-20">
            {q ? `No matches for “${searchQuery}”` : 'No nodes yet — tap + to begin.'}
          </div>
        )}
      </div>
    </div>
  );
}
