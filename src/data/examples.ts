import { Node, Connection, PhilosophyState } from '@/types';

const n: Node[] = [
  { id: 'form-1',    category: 'form',    label: 'Live deliberately',           notes: 'Every action chosen with intention. No drifting.',          x: 520, y: 260, createdAt: 1 },
  { id: 'form-2',    category: 'form',    label: 'Protect my time',             notes: 'Time is the only non-renewable resource.',                  x: 820, y: 220, createdAt: 2 },
  { id: 'goal-1',    category: 'goal',    label: 'Financial freedom',           notes: 'Remove money as a constraint on decisions.',                x: 320, y: 400, createdAt: 3 },
  { id: 'goal-2',    category: 'goal',    label: 'Master my craft',             notes: 'Deep expertise compounds over time.',                       x: 660, y: 420, createdAt: 4 },
  { id: 'problem-1', category: 'problem', label: 'Reduce debt first',           notes: 'Debt is a negative income stream. Clear it before growth.', x: 180, y: 560, createdAt: 5 },
  { id: 'problem-2', category: 'problem', label: 'Ship the evergreen platform', notes: 'The platform is the unlock for everything else.',           x: 560, y: 580, createdAt: 6 },
  { id: 'thought-1', category: 'thought', label: 'Automate income streams',     notes: 'Build systems that earn without trading time.',             x: 380, y: 660, createdAt: 7 },
  { id: 'shadow-1',  category: 'shadow',  label: 'Say no more often',           notes: 'Every yes to the trivial is a no to the essential.',        x: 900, y: 380, createdAt: 8 },
];

const link = (from: string, to: string): Connection => ({ id: `${from}__${to}`, from, to });

const c: Connection[] = [
  link('problem-1', 'goal-1'),
  link('goal-1',    'form-1'),
  link('goal-2',    'problem-2'),
  link('form-2',    'shadow-1'),
  link('form-1',    'form-2'),
  link('thought-1', 'goal-1'),
];

export const EXAMPLE_STATE: PhilosophyState = { nodes: n, connections: c };
export const EXAMPLE_NODES = n;
export const EXAMPLE_CONNECTIONS = c;
