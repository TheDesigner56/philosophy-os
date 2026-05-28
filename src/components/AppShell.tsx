'use client';

import { useState } from 'react';
import { Lesson, PromptPack, Quote, Tab } from '@/types';
import { useStoic } from '@/state/StoicProvider';
import TabBar from '@/components/TabBar';
import Onboarding from '@/features/onboarding/Onboarding';
import TodayView from '@/features/today/TodayView';
import JournalView from '@/features/journal/JournalView';
import JournalComposer from '@/features/journal/JournalComposer';
import LessonsView from '@/features/lessons/LessonsView';
import LessonReader from '@/features/lessons/LessonReader';
import ProgressView from '@/features/progress/ProgressView';
import Paywall from '@/features/paywall/Paywall';
import SettingsSheet from '@/features/settings/SettingsSheet';

interface ComposerState {
  open: boolean;
  pack: PromptPack | null;
  prefill?: string;
  /** Bumped on each open so the composer remounts with fresh state. */
  id: number;
}

export default function AppShell() {
  const { hydrated, prefs } = useStoic();
  const [tab, setTab] = useState<Tab>('today');
  const [composer, setComposer] = useState<ComposerState>({ open: false, pack: null, id: 0 });
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [paywall, setPaywall] = useState<{ open: boolean; source: string }>({ open: false, source: '' });
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!hydrated) return null;
  if (!prefs.onboarded) return <Onboarding />;

  const openReflect = (quote: Quote) =>
    setComposer((c) => ({ open: true, pack: null, prefill: `On “${quote.text}” — `, id: c.id + 1 }));
  const openJournal = () => setComposer((c) => ({ open: true, pack: null, id: c.id + 1 }));
  const openPack = (pack: PromptPack) => setComposer((c) => ({ open: true, pack, id: c.id + 1 }));
  const upgrade = (source: string) => setPaywall({ open: true, source });

  return (
    <div className="fixed inset-0 flex justify-center bg-[#0A0A0A]">
      <main className="relative h-full w-full max-w-md overflow-y-auto">
        {tab === 'today' && (
          <TodayView onReflect={openReflect} onOpenLesson={setLesson} onJournal={openJournal} />
        )}
        {tab === 'journal' && <JournalView onOpenPack={openPack} onUpgrade={upgrade} />}
        {tab === 'lessons' && <LessonsView onOpenLesson={setLesson} onUpgrade={upgrade} />}
        {tab === 'progress' && (
          <ProgressView onUpgrade={upgrade} onOpenSettings={() => setSettingsOpen(true)} />
        )}

        <TabBar active={tab} onChange={setTab} />
      </main>

      {composer.open && (
        <JournalComposer
          key={composer.id}
          onClose={() => setComposer((c) => ({ ...c, open: false }))}
          pack={composer.pack}
          prefillText={composer.prefill}
        />
      )}
      <LessonReader lesson={lesson} onClose={() => setLesson(null)} />
      <Paywall
        open={paywall.open}
        onClose={() => setPaywall({ open: false, source: '' })}
        source={paywall.source}
      />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpgrade={upgrade}
      />
    </div>
  );
}
