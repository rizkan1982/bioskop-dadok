-- Fix admin stats RLS and ensure service role can access all data for analytics

-- Drop existing restrictive policies that might block service role
DROP POLICY IF EXISTS "Users can view their own histories" ON public.histories;
DROP POLICY IF EXISTS "Users can insert their own histories" ON public.histories;
DROP POLICY IF EXISTS "Users can update their own histories" ON public.histories;
DROP POLICY IF EXISTS "Users can delete their own histories" ON public.histories;

DROP POLICY IF EXISTS "Service role can view all histories" ON public.histories;

-- Recreate with proper service role access
CREATE POLICY "Users can view their own histories"
ON public.histories
FOR SELECT
TO authenticated
USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can insert their own histories"
ON public.histories
FOR INSERT
TO authenticated
WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can update their own histories"
ON public.histories
FOR UPDATE
TO authenticated
USING ((( SELECT auth.uid() AS uid) = user_id))
WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can delete their own histories"
ON public.histories
FOR DELETE
TO authenticated
USING ((( SELECT auth.uid() AS uid) = user_id));

-- Service role bypass - allow reading all histories for admin stats
CREATE POLICY "Service role admin access for histories"
ON public.histories
FOR SELECT
TO service_role
USING (true);

-- Ensure watchlist is also accessible to service role for stats
DROP POLICY IF EXISTS "Service role can view all watchlist" ON public.watchlist;
CREATE POLICY "Service role admin access for watchlist"
ON public.watchlist
FOR SELECT
TO service_role
USING (true);

-- Ensure profiles is accessible to service role for admin list
DROP POLICY IF EXISTS "Service role can view all profiles" ON public.profiles;
CREATE POLICY "Service role admin access for profiles"
ON public.profiles
FOR SELECT
TO service_role
USING (true);

-- Make sure indexes exist for better query performance
CREATE INDEX IF NOT EXISTS idx_histories_created_at 
ON public.histories (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_histories_content_type 
ON public.histories (content_type);

CREATE INDEX IF NOT EXISTS idx_histories_tmdb_id 
ON public.histories (tmdb_id);

-- Verify table structure has correct columns after migration
-- If this doesn't work, run the rename migrations manually
