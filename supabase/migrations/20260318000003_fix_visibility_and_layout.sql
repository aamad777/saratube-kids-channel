-- 1. Fix Visibility for Parents in Kid Mode (Select access records)
DROP POLICY IF EXISTS "Children can view their access" ON public.video_child_access;
CREATE POLICY "Children can view their access"
ON public.video_child_access FOR SELECT
USING (
  auth.uid() = child_user_id -- Original: Child sees their own
  OR granted_by = auth.uid() -- NEW: Parent sees what they granted
);

-- 2. Ensure Photos are visible to Parents in all conditions
DROP POLICY IF EXISTS "Children can view shared photos" ON public.kids_photos;
CREATE POLICY "Children can view shared photos"
ON public.kids_photos FOR SELECT
USING (
  child_profile_id = auth.uid()::text 
  OR parent_user_id = auth.uid()::text
);

-- 3. Confirm RLS on video_child_access is enabled
ALTER TABLE public.video_child_access ENABLE ROW LEVEL SECURITY;
