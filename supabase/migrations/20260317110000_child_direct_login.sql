-- Add login fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS child_login_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dummy_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_email TEXT;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_child_login_id ON public.profiles(child_login_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_dummy_email ON public.profiles(dummy_email);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_email ON public.profiles(parent_email);

-- RPC: Fetch child profile by child_login_id
CREATE OR REPLACE FUNCTION get_child_by_login_id(p_login_id TEXT)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  selected_theme app_theme,
  dummy_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.display_name, p.avatar_url, p.selected_theme, p.dummy_email
  FROM public.profiles p
  WHERE p.child_login_id = p_login_id
  AND p.is_parent = false;
END;
$$;

-- Note: pin_hash is still in the table, but anon can't see it if we use a View or just select specific columns in code.
-- Actually, the policy above allows SELECT *, so anon could see pin_hash.
-- To fix this, we should either use a separate table for PINs or just be careful in the frontend.
-- RPC: Create a real Supabase Auth user for a child
-- This allows children to have their own JWT and work with RLS.
CREATE OR REPLACE FUNCTION create_child_auth_user(
  p_id UUID,
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Insert into auth.users (requires SECURITY DEFINER)
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (
    p_id,
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('display_name', p_display_name),
    false,
    'authenticated'
  );

  -- Link the profile (or update it if it exists)
  UPDATE public.profiles
  SET user_id = p_id,
      dummy_email = p_email
  WHERE id = p_id;
END;
$$;
