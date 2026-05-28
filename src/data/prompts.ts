import { PromptPack } from '@/types';

// Free-form is the only free pack. Structured packs are gated behind Pro.
export const PROMPT_PACKS: PromptPack[] = [
  {
    id: 'free-form',
    outcome: 'calm',
    title: 'Free Write',
    description: 'A blank page. Whatever’s on your mind.',
    free: true,
    prompts: [{ id: 'free-form-open', text: 'What’s on your mind?' }],
  },
  {
    id: 'calm-reset',
    outcome: 'calm',
    title: 'Calm Reset',
    description: 'When something rattles you — reset fast.',
    free: false,
    prompts: [
      { id: 'calm-control', text: 'What’s actually in my control here?' },
      { id: 'calm-worst', text: 'What’s the worst case — and could I handle it?', followUp: 'How, specifically?' },
      { id: 'calm-story', text: 'What story am I telling myself that may not be true?' },
    ],
  },
  {
    id: 'discipline-log',
    outcome: 'discipline',
    title: 'Discipline Log',
    description: 'Say what you’ll do. Then face whether you did it.',
    free: false,
    prompts: [
      { id: 'disc-intent', text: 'What did I say I’d do today?' },
      { id: 'disc-evening', text: 'Did I do it?', followUp: 'If not — why? No excuses, just the real reason.' },
      { id: 'disc-tomorrow', text: 'What’s the one thing that matters most tomorrow?' },
    ],
  },
  {
    id: 'evening-reflection',
    outcome: 'discipline',
    title: 'Evening Reflection',
    description: 'Seneca’s nightly review, in three lines.',
    free: false,
    prompts: [
      { id: 'eve-well', text: 'What did I do well today?' },
      { id: 'eve-badly', text: 'What did I do badly?' },
      { id: 'eve-better', text: 'What could I do better tomorrow?' },
    ],
  },
];
