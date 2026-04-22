'use client';

interface FABProps {
  onClick: () => void;
  label?: string;
}

export default function FAB({ onClick, label = 'Add node' }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="md:hidden fixed z-30 bottom-0 right-0 w-14 h-14 rounded-full bg-white text-[#0A0A0A] shadow-2xl flex items-center justify-center fab-enter active:scale-95 transition-transform"
      style={{
        right: 'calc(16px + env(safe-area-inset-right, 0px))',
        bottom: 'calc(16px + var(--safe-bottom))',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
