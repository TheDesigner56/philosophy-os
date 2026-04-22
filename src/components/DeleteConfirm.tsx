'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/cn';

interface DeleteConfirmProps {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirm({ open, label, onCancel, onConfirm }: DeleteConfirmProps) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-enter" />
        <AlertDialog.Content
          className={cn(
            'fixed z-50 bg-[#111111] border border-white/10 shadow-2xl',
            // Mobile: attach to bottom for thumb reach, full-width with safe-area
            'left-0 right-0 bottom-0 rounded-t-[var(--sheet-radius)] p-5 sheet-enter',
            // Desktop: centered card
            'md:left-1/2 md:top-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2',
            'md:w-[calc(100vw-2rem)] md:max-w-sm md:rounded-xl md:dialog-enter md:p-5',
            'focus:outline-none',
          )}
          style={{ paddingBottom: 'max(1.25rem, var(--safe-bottom))' }}
        >
          <AlertDialog.Title className="text-white text-base md:text-sm font-medium">
            Delete node?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-white/55 text-sm md:text-xs mt-2 leading-relaxed">
            <span className="text-white/80">{label}</span> and its connections will be removed.
            This cannot be undone.
          </AlertDialog.Description>
          <div className="flex gap-2 mt-5">
            <AlertDialog.Cancel asChild>
              <button
                className="flex-1 touch-target text-sm md:text-xs text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className="flex-1 touch-target text-sm md:text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 bg-red-500/5 rounded-lg transition-colors"
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
