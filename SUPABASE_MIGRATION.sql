-- ─────────────────────────────────────────────────────────────────────────────
-- Clario — Supabase migration
-- Run this entire file in: Supabase Dashboard > SQL Editor > New query
-- ─────────────────────────────────────────────────────────────────────────────

-- ── subscriptions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  plan                  TEXT,          -- 'weekly' | 'monthly' | 'yearly'
  status                TEXT,          -- 'active' | 'trialing' | 'canceled' | ...
  current_period_end    BIGINT,        -- Unix timestamp
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own row (frontend direct queries if needed)
CREATE POLICY "Users read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Backend uses service_role key → bypasses RLS for writes (no extra policy needed)


-- ── voice_sessions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  session_id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  duration_seconds  INTEGER,
  call_report       JSONB
);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON public.voice_sessions FOR ALL
  USING (auth.uid() = user_id);


-- ── user_settings ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                   TEXT        DEFAULT '',
  daily_reminder         BOOLEAN     DEFAULT TRUE,
  streak_notifications   BOOLEAN     DEFAULT TRUE,
  weekly_digest          BOOLEAN     DEFAULT FALSE,
  reminder_time          TEXT        DEFAULT '08:00',
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id);


-- ── conversation_history ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id          BIGSERIAL   PRIMARY KEY,
  session_id  UUID        NOT NULL REFERENCES public.voice_sessions(session_id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL,   -- 'user' | 'assistant'
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conversation history"
  ON public.conversation_history FOR ALL
  USING (auth.uid() = user_id);


-- ── Helper: auto-update updated_at ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
