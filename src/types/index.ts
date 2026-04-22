export type Category = 'form' | 'goal' | 'problem' | 'thought' | 'shadow';

export interface Node {
  id: string;
  category: Category;
  label: string;
  notes: string;
  x: number;
  y: number;
  createdAt: number;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

export interface PhilosophyState {
  nodes: Node[];
  connections: Connection[];
}

export type ViewMode = 'canvas' | 'list';

export interface CategoryMeta {
  key: Category;
  name: string;
  radius: number;
  fill: string;
  stroke: string;
  text: string;
  glow: boolean;
  order: number;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  form:    { key: 'form',    name: 'Form',    radius: 28, fill: '#F5F5F5', stroke: '#FFFFFF', text: '#0A0A0A', glow: true,  order: 0 },
  goal:    { key: 'goal',    name: 'Goal',    radius: 22, fill: '#C8C8C8', stroke: '#E0E0E0', text: '#0A0A0A', glow: false, order: 1 },
  problem: { key: 'problem', name: 'Problem', radius: 20, fill: '#8A8A8A', stroke: '#A0A0A0', text: '#0A0A0A', glow: false, order: 2 },
  thought: { key: 'thought', name: 'Thought', radius: 16, fill: '#555555', stroke: '#707070', text: '#F5F5F5', glow: false, order: 3 },
  shadow:  { key: 'shadow',  name: 'Shadow',  radius: 14, fill: '#2A2A2A', stroke: '#404040', text: '#C8C8C8', glow: false, order: 4 },
};

export const CATEGORY_ORDER: Category[] = ['form', 'goal', 'problem', 'thought', 'shadow'];
