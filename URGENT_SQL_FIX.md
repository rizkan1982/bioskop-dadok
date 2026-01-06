# URGENT: Jalankan SQL Ini di Supabase Dashboard

## Cara menjalankan:
1. Buka https://supabase.com/dashboard
2. Pilih project bioskop-dadok
3. Buka **SQL Editor** (icon `</>` di sidebar)
4. Copy-paste semua SQL di bawah dan klik **Run**

---

## FIX 1: Update Watchlist Column Name

```sql
-- Rename type to content_type in watchlist (jika belum)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watchlist' AND column_name = 'type') THEN
    ALTER TABLE public.watchlist RENAME COLUMN type TO content_type;
  END IF;
END $$;
```

---

## FIX 2: Update Profiles Table untuk Admin Panel

```sql
-- Add email and is_admin columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Sync email from auth.users to profiles
UPDATE public.profiles p
SET email = (SELECT email FROM auth.users u WHERE u.id = p.id)
WHERE p.email IS NULL;

-- Insert missing users to profiles
INSERT INTO public.profiles (id, username, email, is_admin)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  u.email,
  CASE WHEN u.email = 'stressgue934@gmail.com' THEN true ELSE false END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email;
```

---

## FIX 3: Add RLS Policies for Admin Access

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can view all histories" ON public.histories;
DROP POLICY IF EXISTS "Service role can view all watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Service role can view all profiles" ON public.profiles;

-- Allow service role to read ALL data (for admin panel)
CREATE POLICY "Service role can view all histories"
ON public.histories FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can view all watchlist"
ON public.watchlist FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can view all profiles"
ON public.profiles FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

---

## FIX 4: Auto-create Profile on User Registration

```sql
-- Create trigger to auto-create profile when user registers
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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## VERIFY: Cek hasilnya

```sql
-- Cek semua users di profiles
SELECT id, username, email, is_admin, created_at FROM profiles ORDER BY created_at DESC;

-- Cek total histories
SELECT COUNT(*) as total_histories FROM histories;

-- Cek total watchlist
SELECT COUNT(*) as total_watchlist FROM watchlist;

-- Cek RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('profiles', 'histories', 'watchlist');
```

---

## NOTES:
- Pastikan Vercel environment variable `SUPABASE_SERVICE_ROLE_KEY` sudah diset
- Key ini bisa didapat dari Supabase Dashboard > Settings > API > service_role key
- JANGAN share key ini ke siapapun!
