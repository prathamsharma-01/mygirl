-- ═══════════════════════════════════════════════════
--  Aria AI Voice Companion — Supabase Schema
--  Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Preferences ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  preferences  JSONB DEFAULT '{}',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI Memory ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_memory (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  memory_text  TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Chat Sessions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Chat Messages ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  is_voice    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Voice Sessions ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  duration    INTEGER DEFAULT 0,  -- seconds
  message_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  ended_at    TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user    ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user    ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user   ON public.voice_sessions(user_id);

-- ── Row Level Security (RLS) ──────────────────────
-- Enable RLS on all tables
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions   ENABLE ROW LEVEL SECURITY;

-- NOTE: Since we use service_key on the backend, RLS won't block our server.
-- These policies are for direct client access (if needed):

-- Allow service role full access (bypasses RLS automatically)
-- Users can only read their own data
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (id = auth.uid()::uuid);

CREATE POLICY "prefs_own_data" ON public.user_preferences
  FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "memory_own_data" ON public.user_memory
  FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "sessions_own_data" ON public.chat_sessions
  FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "messages_own_data" ON public.chat_messages
  FOR ALL USING (user_id = auth.uid()::uuid);

-- ── Updated_at Trigger ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
