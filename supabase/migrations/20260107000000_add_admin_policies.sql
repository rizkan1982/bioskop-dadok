-- Add admin policies to allow service role to access all data
-- Run this in Supabase SQL Editor

-- Allow service role (admin) to read all histories
CREATE POLICY "Service role can view all histories"
ON public.histories
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can view all watchlist"
ON public.watchlist
FOR SELECT
TO service_role
USING (true);

-- For profiles, admin needs to see all
CREATE POLICY "Service role can view all profiles"
ON public.profiles
FOR SELECT
TO service_role
USING (true);

-- Add email column to profiles for admin user list
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Add is_admin column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update existing profiles to sync email from auth.users
-- This should be done via trigger but we'll update manually first
UPDATE public.profiles p
SET email = (SELECT email FROM auth.users u WHERE u.id = p.id)
WHERE p.email IS NULL;

-- Create trigger to sync email on new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, is_admin)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN new;
END;
$$;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
