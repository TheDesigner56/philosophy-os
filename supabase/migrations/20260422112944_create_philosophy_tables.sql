CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('form', 'goal', 'problem', 'thought', 'shadow')),
  notes TEXT DEFAULT '',
  x FLOAT NOT NULL DEFAULT 400,
  y FLOAT NOT NULL DEFAULT 350,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_node_id, to_node_id)
);

CREATE TABLE voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  transcript TEXT,
  audio_url TEXT,
  duration_seconds FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

-- Permissive policies (allow all for now)
CREATE POLICY "allow_all_nodes" ON nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_connections" ON connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_voice_notes" ON voice_notes FOR ALL USING (true) WITH CHECK (true);
