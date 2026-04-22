'use client';

import * as RToast from '@radix-ui/react-toast';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

type ToastVariant = 'default' | 'success' | 'danger';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, duration: 2600, variant: 'default', ...toast }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      <RToast.Provider swipeDirection="down" duration={2600}>
        {children}
        {items.map((t) => (
          <RToast.Root
            key={t.id}
            duration={t.duration}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border shadow-2xl',
              'px-4 py-3 text-sm',
              'data-[state=open]:sheet-enter',
              'data-[state=closed]:opacity-0 data-[state=closed]:transition-opacity',
              'data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)]',
              'data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform',
              'data-[swipe=end]:translate-y-full data-[swipe=end]:transition-transform',
              t.variant === 'success' &&
                'border-emerald-500/30 bg-emerald-500/5 text-emerald-100',
              t.variant === 'danger' && 'border-red-500/30 bg-red-500/5 text-red-100',
              (!t.variant || t.variant === 'default') &&
                'border-white/10 bg-[#111111] text-white/90',
            )}
          >
            <div className="flex-1 min-w-0">
              <RToast.Title className="font-medium leading-tight">{t.title}</RToast.Title>
              {t.description && (
                <RToast.Description className="mt-0.5 text-xs text-white/60 leading-snug">
                  {t.description}
                </RToast.Description>
              )}
            </div>
            <RToast.Close
              aria-label="Dismiss"
              className="text-white/30 hover:text-white/70 text-lg leading-none -mr-1 shrink-0"
            >
              ×
            </RToast.Close>
          </RToast.Root>
        ))}
        <RToast.Viewport
          className={cn(
            'fixed z-[60] flex flex-col-reverse gap-2 outline-none',
            // Mobile: full-width stack anchored to bottom, above safe area
            'left-3 right-3',
            'bottom-[calc(12px+var(--safe-bottom))]',
            // Desktop: top-right, narrower
            'md:left-auto md:right-4 md:top-4 md:bottom-auto md:w-[360px] md:max-w-[calc(100vw-2rem)]',
          )}
        />
      </RToast.Provider>
    </ToastContext.Provider>
  );
}
