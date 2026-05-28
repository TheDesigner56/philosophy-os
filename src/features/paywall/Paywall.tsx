'use client';

import { useEffect, useState } from 'react';
import { ProductId } from '@/types';
import { PRODUCTS } from '@/data/products';
import { useStoic } from '@/state/StoicProvider';
import Sheet from '@/components/Sheet';
import { BRAND } from '@/lib/brand';

interface PaywallProps {
  open: boolean;
  onClose: () => void;
  source: string;
}

export default function Paywall({ open, onClose, source }: PaywallProps) {
  const { purchase, track } = useStoic();
  const [selected, setSelected] = useState<ProductId>('annual');

  useEffect(() => {
    if (open) track('paywall_view', { source });
  }, [open, source, track]);

  const product = PRODUCTS.find((p) => p.id === selected)!;

  const buy = () => {
    if (product.trialDays > 0) track('trial_start', { product: product.id });
    // TODO(decision): wire StoreKit 2 on iOS / Stripe on web. Mock unlocks Pro now.
    purchase(product.id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Stoic OS Pro" maxHeightVh={92}>
      <div className="px-5 pb-6 pt-1">
        <p className="text-[11px] tracking-[0.3em] uppercase text-white/40">{BRAND.appName} Pro</p>
        <h2 className="mt-2 font-serif text-2xl text-white">Become unshakeable — or it’s free.</h2>
        <p className="mt-2 text-sm text-white/55">
          Unlock every prompt pack, the full lessons library + daily drip, progress analytics, premium
          widgets, and streak insurance.
        </p>

        <div className="mt-5 space-y-3">
          {PRODUCTS.map((p) => {
            const active = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  active ? 'border-white/80 bg-white/10' : 'border-white/15 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{p.title}</span>
                  {p.badge && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-serif text-xl text-white">{p.price}</span>
                  <span className="text-sm text-white/45">{p.period}</span>
                </div>
                <p className="mt-1 text-xs text-white/45">{p.blurb}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={buy}
          className="mt-5 w-full rounded-full bg-white py-3.5 font-medium text-black touch-target"
        >
          {product.trialDays > 0 ? `Start ${product.trialDays}-day free trial` : 'Continue'}
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/30">
          {product.trialDays > 0
            ? `${product.trialDays} days free, then ${product.price}${product.period}. `
            : ''}
          Auto-renews unless cancelled at least 24h before the period ends. Manage or cancel in your
          account settings. Founding seats are limited and the offer expires.
        </p>
      </div>
    </Sheet>
  );
}
