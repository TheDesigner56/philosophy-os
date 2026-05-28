-- Waitlist signups for the home-screen widget launch.
create table if not exists waitlist (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null unique,
  created_at  timestamptz not null default now()
);

alter table waitlist enable row level security;

-- Anyone may join (anon insert). No select policy: emails are not readable
-- through the anon key, only via the service role / dashboard.
create policy "waitlist_insert" on waitlist
  for insert with check (true);
