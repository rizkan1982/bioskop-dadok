-- Create stored procedure for admin management that bypasses RLS

-- Drop existing function if any
DROP FUNCTION IF EXISTS public.remove_admin_access(uuid) CASCADE;

-- Create function to remove admin access
CREATE OR REPLACE FUNCTION public.remove_admin_access(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_updated_count int;
BEGIN
  -- Get email first for logging
  SELECT email INTO v_email FROM public.profiles WHERE id = user_id;
  
  IF v_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User tidak ditemukan',
      'user_id', user_id
    );
  END IF;

  -- Update is_admin to false
  UPDATE public.profiles 
  SET is_admin = false 
  WHERE id = user_id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Verify the update
  IF v_updated_count > 0 THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Admin access removed',
      'user_id', user_id,
      'email', v_email,
      'updated_count', v_updated_count
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Failed to update user',
      'user_id', user_id,
      'email', v_email
    );
  END IF;
END;
$$;

-- Create function to get all admin users
DROP FUNCTION IF EXISTS public.get_admin_users() CASCADE;

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(id uuid, email text, is_admin boolean, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.is_admin, p.created_at
  FROM public.profiles p
  WHERE p.is_admin = true
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.remove_admin_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO anon, authenticated;
