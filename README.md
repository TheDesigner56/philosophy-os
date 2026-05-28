# Stoic OS

> The pocket operating system that makes you **unshakeable and disciplined** — daily.

A local-first web build of Stoic OS, implementing the PRD/TRD. Every feature maps
to one of two user outcomes: **Calm** (less reactive) or **Disciplined** (consistent).

This is the **web build for testing**; it’s designed so the product/UX can later be
ported to the native iOS app (SwiftUI / WidgetKit / StoreKit) described in the spec.
iOS-only pieces (home-screen widgets, StoreKit purchases, scheduled notifications)
are implemented as web equivalents or marked with `// TODO(decision)`.

## Features

- **Today** — the daily quote (deterministic per day), today’s lesson drip, and a one-tap journal CTA.
- **Quote feed** — save, share (branded PNG card carrying the app name + IG handle), and “reflect” → prefilled journal.
- **Journaling** — free-form (free, 7-day history) + structured prompt packs (Calm Reset, Discipline Log, Evening Reflection) gated behind Pro. Optional mood/reactivity sliders feed analytics.
- **Lessons** — bite-sized concept + one action. 3 free starters; full library + daily drip for Pro.
- **Streaks** — daily-action streak with longest tracking, Pro streak-insurance freezes, and an at-risk indicator.
- **Progress** — streak/entry stats for everyone; reactivity trend + discipline scorecard for Pro.
- **Onboarding** — 4 screens, outcome selection, first win in <60s, reminder/notification setup, then the offer.
- **Paywall** — annual-first, monthly, founding-member, with trial copy + App Store disclosure.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm test         # vitest unit + component tests
npm run lint     # eslint
```

## Architecture

- **Next.js 16 App Router**, React 19, TypeScript, Tailwind v4. Mobile-first, dark, serif quotes.
- `src/types` — domain models (Quote, Lesson, JournalEntry, StreakState, …).
- `src/data` — bundled content: `quotes`, `lessons`, `prompts`, `products`.
- `src/lib` — pure, tested core: `dates`, `daily` (deterministic per-day index), `quotes`, `lessons`, `streak`, `entitlement` (free-tier gating), `content` (remote pull + bundled fallback), `analytics`, `storage`, `notifications`, `brand`.
- `src/state/StoicProvider` — single client store, hydrated from `localStorage`, exposing all actions. `isPro` is the single entitlement source of truth.
- `src/features/*` — feature-foldered UI: `onboarding`, `today`, `quotes`, `journal`, `lessons`, `streaks`, `progress`, `paywall`, `settings`.
- `src/app/api/content` — the “remote” content endpoint; set `NEXT_PUBLIC_CONTENT_URL` to enable a daily pull (falls back to bundled content on any failure).

## Testing Pro / resetting

The Pro purchase flow is mocked for the web build (it unlocks `isPro` immediately).
**Progress → Settings** has a *Simulate Pro* toggle and *Reset app data* for testing
gating both ways.

## Notable TODO(decision)s

- StoreKit 2 (iOS) / Stripe (web) for real purchases — currently mocked.
- Cloud backup/sync for Pro (TRD mentions CloudKit; web could use a managed backend).
- Service worker for scheduled web reminders.
- Remote content host (CDN vs managed) — pick the cheapest that ships.
- Founding member: true lifetime vs locked annual.
