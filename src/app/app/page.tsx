import type { Metadata } from 'next';
import PhilosophyApp from '@/components/PhilosophyApp';

export const metadata: Metadata = {
  title: 'Philosophy OS — the map',
  description: 'Map what matters. Live deliberately.',
};

export default function AppPage() {
  return <PhilosophyApp />;
}
