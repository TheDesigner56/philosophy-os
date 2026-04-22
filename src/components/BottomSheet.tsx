'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Visual max height as a vh-ish cap. Default 85. */
  maxHeightVh?: number;
  /** Identifier, used to force re-run of enter animation when content changes. */
  keyId?: string;
  ariaLabel?: string;
}

export default function BottomSheet({
  open,
  onClose,
  children,
  maxHeightVh = 85,
  keyId,
  ariaLabel,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    currentY.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (startY.current == null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) {
      currentY.current = dy;
      setDragOffset(dy);
    }
  }, []);

  const onPointerUp = useCallback(() => {
    if (startY.current == null) return;
    const dy = currentY.current;
    startY.current = null;
    currentY.current = 0;
    if (dy > 100) {
      setDragOffset(0);
      onClose();
    } else {
      setDragOffset(0);
    }
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-enter"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        key={keyId}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="absolute left-0 right-0 bottom-0 bg-[#111111] border-t border-white/10 shadow-2xl sheet-enter flex flex-col"
        style={{
          borderTopLeftRadius: 'var(--sheet-radius)',
          borderTopRightRadius: 'var(--sheet-radius)',
          maxHeight: `${maxHeightVh}vh`,
          transform: dragOffset ? `translateY(${dragOffset}px)` : undefined,
          transition: dragOffset ? 'none' : 'transform 0.2s ease-out',
          paddingBottom: 'var(--safe-bottom)',
        }}
      >
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="sheet-handle" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
