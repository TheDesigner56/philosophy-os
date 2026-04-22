'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

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
  const startY = useRef<number | null>(null);
  const currentY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

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

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-enter md:hidden" />
        <Dialog.Content
          key={keyId}
          aria-label={ariaLabel}
          onOpenAutoFocus={(e) => {
            // Avoid Radix forcibly scrolling the focused input into view on mobile
            // (causes layout jumps with the keyboard). Let our own focus effects handle it.
            e.preventDefault();
          }}
          className={cn(
            'fixed left-0 right-0 bottom-0 z-40 flex flex-col',
            'bg-[#111111] border-t border-white/10 shadow-2xl sheet-enter',
            'md:hidden focus:outline-none',
          )}
          style={{
            borderTopLeftRadius: 'var(--sheet-radius)',
            borderTopRightRadius: 'var(--sheet-radius)',
            maxHeight: `${maxHeightVh}vh`,
            transform: dragOffset ? `translateY(${dragOffset}px)` : undefined,
            transition: dragOffset ? 'none' : 'transform 0.2s ease-out',
            paddingBottom: 'var(--safe-bottom)',
          }}
        >
          <Dialog.Title className="sr-only">{ariaLabel ?? 'Sheet'}</Dialog.Title>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
