-- Create anonymous_sessions table to track non-authenticated visitors
CREATE TABLE IF NOT EXISTS public.anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT,
  duration_watched INTEGER DEFAULT 0, -- seconds
  total_duration INTEGER, -- seconds
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_session_id ON public.anonymous_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_media_id ON public.anonymous_sessions(media_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_media_type ON public.anonymous_sessions(media_type);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_created_at ON public.anonymous_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_started_at ON public.anonymous_sessions(started_at);

-- Enable RLS
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT (for analytics)
CREATE POLICY "Allow all to read anonymous sessions"
  ON public.anonymous_sessions
  FOR SELECT
  USING (true);

-- Allow service role to INSERT/UPDATE
CREATE POLICY "Allow service role to manage anonymous sessions"
  ON public.anonymous_sessions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
