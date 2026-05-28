'use client';

import { useState } from 'react';
import { joinWaitlist } from '@/lib/waitlist';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    const res = await joinWaitlist(email);
    if (res.ok) {
      setStatus('done');
      setMessage(res.already ? "You're already on the list." : "You're on the list. We'll be in touch.");
    } else {
      setStatus('error');
      setMessage(res.error);
    }
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 right-[-10%] top-1/2 -translate-y-1/2 h-[120vh] w-[120vh] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 60%)' }}
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* ── Copy + waitlist ── */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="text-[11px] sm:text-xs font-light uppercase tracking-[0.32em] text-white/45">
            Coming soon · Stoicism for your home screen
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Carry your philosophy
            <br className="hidden sm:block" /> on your home screen.
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/60 sm:text-lg lg:mx-0">
            A daily Stoic reminder, one glance away. Join the waitlist and be first to add the widget.
          </p>

          {status === 'done' ? (
            <div className="mt-8 flex items-center justify-center gap-2.5 lg:justify-start">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0A0A0A]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="text-sm text-white/80">{message}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row lg:mx-0"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="you@example.com"
                aria-label="Email address"
                aria-invalid={status === 'error'}
                className="h-14 flex-1 rounded-full border border-white/20 bg-white/[0.04] px-6 text-[15px] text-white placeholder-white/35 transition-colors focus:border-white/45 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-14 shrink-0 rounded-full bg-white px-7 text-[15px] font-semibold text-[#0A0A0A] transition-opacity hover:bg-white/90 disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
              </button>
            </form>
          )}

          <p className="mt-4 h-5 text-sm text-white/40">
            {status === 'error' ? <span className="text-red-400/80">{message}</span> : 'No spam — just a note when we launch.'}
          </p>

          <a
            href="#try"
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
          >
            Or explore the live map
            <span aria-hidden>↓</span>
          </a>
        </div>

        {/* ── Device ── */}
        <div className="order-1 flex flex-col items-center lg:order-2">
          <div
            role="img"
            aria-label="An iPhone home screen showing the Daily Stoic widget with a Marcus Aurelius quote."
            className="w-[260px] sm:w-[320px] lg:w-[380px]"
            style={{
              aspectRatio: '520 / 900',
              backgroundImage: 'url(/widget-phone.svg)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">
            The Daily Stoic widget · refreshed each morning
          </p>
        </div>
      </div>
    </section>
  );
}
