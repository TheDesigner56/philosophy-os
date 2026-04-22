'use client';

import { useEffect, useRef } from 'react';

interface DeleteConfirmProps {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirm({ open, label, onCancel, onConfirm }: DeleteConfirmProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-enter"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="relative bg-[#111111] border border-white/10 rounded-xl w-[calc(100vw-2rem)] max-w-sm mx-4 p-5 shadow-2xl dialog-enter"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <h3 id="delete-confirm-title" className="text-white text-sm font-medium">
          Delete node?
        </h3>
        <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
          <span className="text-white/70">{label}</span> and its connections will be removed. This
          cannot be undone.
        </p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 touch-target text-xs text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="flex-1 touch-target text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 bg-red-500/5 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
