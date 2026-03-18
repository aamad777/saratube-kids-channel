-- Explicitly fix RLS for video_child_access to allow INSERT and UPDATE
-- The previous "FOR ALL" with only "USING" might be failing on Supabase's PG version for INSERT.

-- 1. Drop existing policy
DROP POLICY IF EXISTS "Video owners can manage child access" ON public.video_child_access;

-- 2. Create more robust policy with explicit WITH CHECK for INSERT/UPDATE
CREATE POLICY "Video owners can manage child access"
ON public.video_child_access FOR ALL
USING (auth.uid() = granted_by)
WITH CHECK (auth.uid() = granted_by);

-- 3. Double check visibility policy (allow parents to see what they granted)
DROP POLICY IF EXISTS "Children can view their access" ON public.video_child_access;
CREATE POLICY "Children can view their access"
ON public.video_child_access FOR SELECT
USING (
  auth.uid() = child_user_id 
  OR auth.uid() = granted_by
);

-- 4. Just in case, grant all to authenticated users (RLS still controls access)
GRANT ALL ON TABLE public.video_child_access TO authenticated;
GRANT ALL ON TABLE public.video_child_access TO service_role;
