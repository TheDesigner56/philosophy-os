import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoicProvider } from '@/state/StoicProvider';

export const metadata: Metadata = {
  title: 'Stoic OS — Unshakeable and disciplined, daily',
  description:
    'The pocket operating system that makes you calm and consistent. Daily Stoic quotes, journaling, lessons, and streaks.',
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0A0A0A] text-white/90">
        <StoicProvider>{children}</StoicProvider>
      </body>
    </html>
  );
}
