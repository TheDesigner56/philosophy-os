'use client';

import { useStoic } from '@/state/StoicProvider';
import Sheet from '@/components/Sheet';
import { BRAND } from '@/lib/brand';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: (source: string) => void;
}

export default function SettingsSheet({ open, onClose, onUpgrade }: SettingsSheetProps) {
  const { isPro, setPro, prefs } = useStoic();

  const resetApp = () => {
    if (typeof window === 'undefined') return;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('stoic-os:'))
      .forEach((k) => window.localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Settings">
      <div className="px-5 pb-6 pt-1">
        <h2 className="font-serif text-xl text-white">Settings</h2>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Subscription</span>
            <span className={`text-sm ${isPro ? 'text-emerald-400/80' : 'text-white/45'}`}>
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>
          {!isPro && (
            <button
              onClick={() => onUpgrade('settings')}
              className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-medium text-black touch-target"
            >
              Upgrade to {BRAND.appName} Pro
            </button>
          )}
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <p className="text-white/70">Reminder</p>
          <p className="mt-0.5 text-white/40">
            {prefs.notificationsEnabled
              ? `Daily at ${prefs.reminderTime ?? '—'}`
              : 'Notifications off'}
          </p>
        </div>

        {/* Testing affordances — not shipped on iOS. */}
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Testing</p>
          <label className="mt-3 flex items-center justify-between text-sm text-white/70">
            <span>Simulate Pro</span>
            <input
              type="checkbox"
              checked={isPro}
              onChange={(e) => setPro(e.target.checked)}
              className="h-5 w-5 accent-white"
            />
          </label>
          <button
            onClick={resetApp}
            className="mt-3 w-full rounded-full border border-white/15 py-2.5 text-sm text-white/60 touch-target"
          >
            Reset app data
          </button>
        </div>
      </div>
    </Sheet>
  );
}
