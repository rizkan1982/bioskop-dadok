# Manual SQL Update untuk Supabase Production

Karena tidak bisa akses langsung ke dashboard Supabase, silakan jalankan SQL ini secara manual di Supabase Dashboard:

## Cara menjalankan:
1. Buka dashboard Supabase: https://supabase.com/dashboard
2. Pilih project: bioskop-dadok
3. Buka SQL Editor (ikon </> di sidebar kiri)
4. Copy-paste SQL di bawah ini
5. Klik "Run"

## SQL untuk update schema:

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
