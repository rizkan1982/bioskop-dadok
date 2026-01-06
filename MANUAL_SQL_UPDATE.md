# Manual SQL Update untuk Supabase Production

Karena tidak bisa akses langsung ke dashboard Supabase, silakan jalankan SQL ini secara manual di Supabase Dashboard:

## Cara menjalankan:
1. Buka dashboard Supabase: https://supabase.com/dashboard
2. Pilih project: bioskop-dadok
3. Buka SQL Editor (ikon </> di sidebar kiri)
4. Copy-paste SQL di bawah ini
5. Klik "Run"

---

## ⚠️ PENTING: Update Histories Table Schema (January 6, 2026)

**Jalankan ini terlebih dahulu** untuk memperbaiki mismatch antara database dan TypeScript types:

```sql
-- Update histories table structure to match TypeScript types
-- Rename columns to match the expected naming convention

-- Rename columns
ALTER TABLE public.histories 
  RENAME COLUMN media_id TO tmdb_id;

ALTER TABLE public.histories 
  RENAME COLUMN type TO content_type;

ALTER TABLE public.histories 
  RENAME COLUMN last_position TO progress;

ALTER TABLE public.histories 
  RENAME COLUMN season TO season_number;

ALTER TABLE public.histories 
  RENAME COLUMN episode TO episode_number;

-- Add watched_at column (for tracking last watch time)
ALTER TABLE public.histories 
  ADD COLUMN IF NOT EXISTS watched_at timestamp with time zone DEFAULT now();

-- Update the unique constraint to use new column names
ALTER TABLE public.histories 
  DROP CONSTRAINT IF EXISTS histories_user_id_media_id_type_season_episode_key;

ALTER TABLE public.histories 
  ADD CONSTRAINT histories_user_id_tmdb_id_content_type_season_episode_key 
  UNIQUE (user_id, tmdb_id, content_type, season_number, episode_number);

-- Update the check constraint
ALTER TABLE public.histories 
  DROP CONSTRAINT IF EXISTS histories_type_check;

ALTER TABLE public.histories 
  ADD CONSTRAINT histories_content_type_check 
  CHECK (content_type = ANY (ARRAY['movie'::text, 'tv'::text]));

-- Drop old index and create new one with updated column names
DROP INDEX IF EXISTS histories_user_updated_idx;
CREATE INDEX histories_user_updated_idx ON public.histories (user_id, updated_at DESC);

-- Update watchlist table to match
ALTER TABLE public.watchlist 
  RENAME COLUMN type TO content_type;

ALTER TABLE public.watchlist 
  DROP CONSTRAINT IF EXISTS watchlist_type_check;

ALTER TABLE public.watchlist 
  ADD CONSTRAINT watchlist_content_type_check 
  CHECK (content_type = ANY (ARRAY['movie'::text, 'tv'::text]));

-- Update watchlist primary key constraint
ALTER TABLE public.watchlist 
  DROP CONSTRAINT IF EXISTS watchlist_pkey;

ALTER TABLE public.watchlist 
  ADD CONSTRAINT watchlist_pkey 
  PRIMARY KEY (user_id, id, content_type);
```

---

## SQL untuk update admin fields:

```sql
-- Add is_admin and email fields to profiles table if not exists
-- This migration ensures production database matches the types

-- Add is_admin column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add email column  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Add updated_at column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Set stressgue934@gmail.com as admin
-- First, find the user ID from auth.users
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get user ID for stressgue934@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'stressgue934@gmail.com'
  LIMIT 1;
  
  -- If user exists, set as admin
  IF admin_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET is_admin = true
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Set user % as admin', admin_user_id;
  ELSE
    RAISE NOTICE 'User stressgue934@gmail.com not found in auth.users';
  END IF;
END $$;
```

## Setelah menjalankan SQL:

1. Regenerate Supabase types:
   ```bash
   npm run sb-db-types
   ```
   
2. Atau jika menggunakan remote database:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/utils/supabase/types.ts
   ```

3. Commit dan push perubahan types

## Verifikasi:

Setelah menjalankan SQL, coba query ini untuk memverifikasi:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- Check admin status
SELECT p.id, p.email, p.is_admin, u.email as auth_email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'stressgue934@gmail.com';
```
