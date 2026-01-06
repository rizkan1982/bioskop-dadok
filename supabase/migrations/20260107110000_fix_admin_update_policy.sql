-- Fix service role UPDATE and DELETE access for admin management

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Service role admin access for profiles" ON public.profiles;

-- Create comprehensive service role policies for profiles table
-- Service role needs SELECT, UPDATE, DELETE for admin management
CREATE POLICY "Service role full access for profiles"
ON public.profiles
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can update profiles"
ON public.profiles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete profiles"
ON public.profiles
FOR DELETE
TO service_role
USING (true);

-- Ensure other policies don't block service role
-- Keep user-level policies for their own data
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Add comprehensive logging comment
-- Service role (used in API endpoints) can now:
-- 1. Read all profiles (for admin list)
-- 2. Update profiles (for changing is_admin flag)
-- 3. Delete profiles (if needed in future)
-- Authenticated users can only access their own profile
