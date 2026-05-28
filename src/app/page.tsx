import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main className="relative bg-[#0A0A0A] text-white/90">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-light tracking-[0.28em] text-white">ΦΙΛΟΣΟΦΙΑ</span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/30">Philosophy OS</span>
        </div>
        <a
          href="#try"
          className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/60 transition-colors hover:border-white/35 hover:text-white/90"
        >
          Live map
        </a>
      </header>

      <Hero />

      {/* Live tool */}
      <section id="try" className="border-t border-white/10 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">The app, today</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Try the live map
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
                Map your goals, problems, and guiding principles as a constellation — then connect
                what reinforces what. The widget will surface it on your home screen.
              </p>
            </div>
            <a
              href="/app"
              className="shrink-0 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition-colors hover:border-white/45 hover:text-white"
            >
              Open full screen ↗
            </a>
          </div>

          <div className="mt-8 h-[78vh] min-h-[520px] overflow-hidden rounded-2xl border border-white/12 bg-[#0A0A0A] shadow-2xl">
            <iframe
              src="/app"
              title="Philosophy OS — live map"
              loading="lazy"
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-white/35 sm:flex-row">
          <span className="tracking-[0.28em] text-white/45">ΦΙΛΟΣΟΦΙΑ</span>
          <span>Live deliberately. © {new Date().getFullYear()} Philosophy OS.</span>
        </div>
      </footer>
    </main>
  );
}
