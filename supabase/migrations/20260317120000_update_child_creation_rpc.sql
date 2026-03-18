
-- 1. First, let's make sure things are visible by turning off RLS temporarily for a test
-- (We will turn it back on with better policies below)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links DISABLE ROW LEVEL SECURITY;

-- 2. Repair schema again just in case
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_by_parent UUID REFERENCES auth.users(id);

-- Ensure other columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dummy_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_email TEXT;

-- Create missing tables
CREATE TABLE IF NOT EXISTS public.parent_child_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, child_user_id)
);

CREATE TABLE IF NOT EXISTS public.user_video_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, 
  UNIQUE(user_id, category)
);

CREATE TABLE IF NOT EXISTS public.blocked_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  blocked_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_user_id, category)
);

-- 3. Convert restrictive columns to TEXT
DO $$ 
BEGIN 
  ALTER TABLE public.profiles ALTER COLUMN selected_theme DROP DEFAULT;
  ALTER TABLE public.profiles ALTER COLUMN selected_theme TYPE TEXT;
  ALTER TABLE public.profiles ALTER COLUMN selected_theme SET DEFAULT 'rainbow';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Clear and Reset ALL Policies for Profiles (Start Fresh)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Parents can view created children" ON public.profiles;
DROP POLICY IF EXISTS "Allow anonymous child lookup by name" ON public.profiles;
DROP POLICY IF EXISTS "Search child profiles" ON public.profiles;
DROP POLICY IF EXISTS "Parents manage links" ON public.parent_child_links;
DROP POLICY IF EXISTS "Profiles are viewable by owner or authorized parent" ON public.profiles;

-- Create one "Master Visibility" policy for Profiles
CREATE POLICY "Master Profile Visibility"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id OR 
  created_by_parent = auth.uid() OR
  is_parent = false OR
  EXISTS (
    SELECT 1 FROM public.parent_child_links 
    WHERE parent_user_id = auth.uid() AND child_user_id = profiles.user_id
  )
);

-- Create policies for links
CREATE POLICY "Master Link Visibility"
ON public.parent_child_links FOR ALL
USING (auth.uid() = parent_user_id);

-- 5. Re-enable RLS with these new clean policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

-- 6. Ensure the RPC is using the correct linking logic
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
BEGIN
  -- A. Create Auth User
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (
    p_id, p_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('display_name', p_display_name),
    false, 'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- B. Force Create/Update Profile with explicit Parent assignment
  INSERT INTO public.profiles (
    id, user_id, display_name, pin_hash, age, selected_theme, is_parent, created_by_parent, parent_email, dummy_email
  )
  VALUES (
    p_id, p_id, p_display_name, p_pin_hash, p_age, p_selected_theme,
    false, p_created_by_parent, p_parent_email, p_email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    pin_hash = EXCLUDED.pin_hash,
    age = EXCLUDED.age,
    selected_theme = EXCLUDED.selected_theme,
    is_parent = EXCLUDED.is_parent,
    created_by_parent = EXCLUDED.created_by_parent,
    parent_email = EXCLUDED.parent_email,
    dummy_email = EXCLUDED.dummy_email;

  -- C. Create Link
  INSERT INTO public.parent_child_links (parent_user_id, child_user_id)
  VALUES (p_created_by_parent, p_id)
  ON CONFLICT DO NOTHING;

  -- D. Blocks
  FOREACH v_category IN ARRAY p_blocked_categories
  LOOP
    INSERT INTO public.blocked_categories (child_user_id, category, blocked_by)
    VALUES (p_id, v_category, p_created_by_parent)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- E. Interests
  FOREACH v_interest IN ARRAY p_interests
  LOOP
    INSERT INTO public.user_video_preferences (user_id, category)
    VALUES (p_id, v_interest)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;
