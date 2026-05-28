import { supabase } from '@/lib/supabase';

const LOCAL_KEY = 'philosophy-os:waitlist';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistResult =
  | { ok: true; already: boolean }
  | { ok: false; error: string };

function saveLocal(email: string): { already: boolean } {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (list.includes(email)) return { already: true };
    list.push(email);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // quota / parse errors — best-effort only
  }
  return { already: false };
}

// Mirrors the app's persistence model: use Supabase when configured, otherwise
// fall back to localStorage so the form works without a backend.
export async function joinWaitlist(rawEmail: string): Promise<WaitlistResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('waitlist').insert({ email });
      if (!error) return { ok: true, already: false };
      if ((error as { code?: string }).code === '23505') {
        return { ok: true, already: true }; // unique_violation: already signed up
      }
      // Other errors (missing table, network) fall through to local backup
    } catch {
      // network failure — fall through to local backup
    }
  }

  return { ok: true, already: saveLocal(email).already };
}
