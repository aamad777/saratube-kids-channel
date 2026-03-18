/* Add child_login_id column if it doesn't exist */
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS child_login_id TEXT UNIQUE;

/* Add function to generate short unique IDs */
CREATE OR REPLACE FUNCTION public.generate_unique_child_login_id() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  exists_id BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE child_login_id = result) INTO exists_id;
    EXIT WHEN NOT exists_id;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

/* Update existing profiles that don't have an ID */
UPDATE public.profiles 
SET child_login_id = public.generate_unique_child_login_id() 
WHERE is_parent = false AND (child_login_id IS NULL OR child_login_id = '');

/* Drop old version to avoid ambiguity, then update RPC */
DROP FUNCTION IF EXISTS public.create_child_auth_user(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, UUID, TEXT, TEXT[], TEXT[]);

CREATE OR REPLACE FUNCTION public.create_child_auth_user(
  p_id UUID,
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_pin_hash TEXT,
  p_age INTEGER,
  p_selected_theme TEXT,
  p_created_by_parent UUID,
  p_parent_email TEXT,
  p_child_login_id TEXT DEFAULT NULL,
  p_blocked_categories TEXT[] DEFAULT '{}',
  p_interests TEXT[] DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  v_category TEXT;
  v_interest TEXT;
  v_final_login_id TEXT := p_child_login_id;
BEGIN
  -- 1. Generate ID if not provided
  IF v_final_login_id IS NULL OR v_final_login_id = '' THEN
    v_final_login_id := public.generate_unique_child_login_id();
  END IF;

  -- 2. Create Auth User
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (
    p_id, p_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('display_name', p_display_name),
    'authenticated', 'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt(p_password, gen_salt('bf')),
    raw_user_meta_data = jsonb_build_object('display_name', p_display_name);

  -- 3. Create/Update Profile
  INSERT INTO public.profiles (
    id, user_id, display_name, pin_hash, age, selected_theme, 
    is_parent, created_by_parent, parent_email, dummy_email, child_login_id
  )
  VALUES (
    p_id, p_id, p_display_name, p_pin_hash, p_age, p_selected_theme,
    false, p_created_by_parent, p_parent_email, p_email, v_final_login_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    pin_hash = EXCLUDED.pin_hash,
    age = EXCLUDED.age,
    selected_theme = EXCLUDED.selected_theme,
    is_parent = EXCLUDED.is_parent,
    created_by_parent = EXCLUDED.created_by_parent,
    parent_email = EXCLUDED.parent_email,
    dummy_email = EXCLUDED.dummy_email,
    child_login_id = EXCLUDED.child_login_id;

  -- 4. Links & Permissions
  INSERT INTO public.parent_child_links (parent_user_id, child_user_id)
  VALUES (p_created_by_parent, p_id)
  ON CONFLICT DO NOTHING;

  FOREACH v_category IN ARRAY p_blocked_categories LOOP
    INSERT INTO public.blocked_categories (child_user_id, category, blocked_by)
    VALUES (p_id, v_category, p_created_by_parent) ON CONFLICT DO NOTHING;
  END LOOP;

  FOREACH v_interest IN ARRAY p_interests LOOP
    INSERT INTO public.user_video_preferences (user_id, category)
    VALUES (p_id, v_interest) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;
