-- nodes: text IDs preserve compatibility with existing app-generated IDs
create table if not exists nodes (
  id            text        primary key,
  user_id       uuid,
  text          text        not null default '',
  category      text        not null check (category in ('form','goal','problem','thought','shadow')),
  notes         text        not null default '',
  x             float8      not null default 0,
  y             float8      not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists connections (
  id            text        primary key,
  from_node_id  text        not null references nodes(id) on delete cascade,
  to_node_id    text        not null references nodes(id) on delete cascade,
  user_id       uuid,
  created_at    timestamptz not null default now(),
  unique (from_node_id, to_node_id)
);

create table if not exists voice_notes (
  id            text        primary key default gen_random_uuid()::text,
  node_id       text        not null references nodes(id) on delete cascade,
  user_id       uuid,
  transcript    text        not null default '',
  audio_url     text,
  duration      float8,
  created_at    timestamptz not null default now()
);

-- RLS
alter table nodes       enable row level security;
alter table connections enable row level security;
alter table voice_notes enable row level security;

-- Permissive policies: allow all (auth will be tightened later)
create policy "nodes_all"       on nodes       for all using (true) with check (true);
create policy "connections_all" on connections for all using (true) with check (true);
create policy "voice_notes_all" on voice_notes for all using (true) with check (true);

-- Auto-update updated_at on nodes
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger nodes_set_updated_at
  before update on nodes
  for each row execute function set_updated_at();
