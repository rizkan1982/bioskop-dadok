-- Create function to add admin access (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.add_admin_access(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Update is_admin to true for the user
  UPDATE profiles
  SET is_admin = true
  WHERE id = user_id;

  -- Return success result
  result := json_build_object(
    'success', true,
    'message', 'Admin access granted'
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := json_build_object(
    'success', false,
    'message', SQLERRM
  );
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_admin_access(uuid) TO authenticated;
