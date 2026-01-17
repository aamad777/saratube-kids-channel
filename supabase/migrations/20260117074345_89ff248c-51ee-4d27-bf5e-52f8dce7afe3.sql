-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Parents can view child profiles for linking" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create fixed policies without recursive self-references
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Parents can view child profiles using parent_child_links table instead of self-reference
CREATE POLICY "Parents can view linked child profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_child_links.parent_user_id = auth.uid()
    AND parent_child_links.child_user_id = profiles.user_id
  )
);