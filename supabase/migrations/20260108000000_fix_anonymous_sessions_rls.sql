-- Fix RLS policies for anonymous_sessions table
-- Drop old policies
DROP POLICY IF EXISTS "Allow all to read anonymous sessions" ON public.anonymous_sessions;
DROP POLICY IF EXISTS "Allow service role to manage anonymous sessions" ON public.anonymous_sessions;

-- Create new policies
-- Allow anyone to SELECT (for stats)
CREATE POLICY "allow_read_anonymous_sessions"
  ON public.anonymous_sessions
  FOR SELECT
  USING (true);

-- Allow service role to INSERT
CREATE POLICY "allow_insert_anonymous_sessions"
  ON public.anonymous_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow service role to UPDATE
CREATE POLICY "allow_update_anonymous_sessions"
  ON public.anonymous_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Also allow anon role to INSERT/UPDATE for public tracking
CREATE POLICY "allow_anon_insert_anonymous_sessions"
  ON public.anonymous_sessions
  FOR INSERT
  TO public, anon
  WITH CHECK (true);

CREATE POLICY "allow_anon_update_anonymous_sessions"
  ON public.anonymous_sessions
  FOR UPDATE
  TO public, anon
  USING (true)
  WITH CHECK (true);
