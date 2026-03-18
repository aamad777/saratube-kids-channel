-- Simplify video_child_access RLS to fix 403 Forbidden
-- This allows the parent who is granting access to insert the record successfully.
DROP POLICY IF EXISTS "Video owners can manage child access" ON public.video_child_access;
CREATE POLICY "Video owners can manage child access"
ON public.video_child_access FOR ALL
USING (auth.uid() = granted_by);

-- Ensure children can still see their own access
DROP POLICY IF EXISTS "Children can view their access" ON public.video_child_access;
CREATE POLICY "Children can view their access"
ON public.video_child_access FOR SELECT
USING (auth.uid() = child_user_id);
