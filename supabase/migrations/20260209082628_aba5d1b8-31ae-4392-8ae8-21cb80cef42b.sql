-- Fix infinite recursion between videos and video_child_access RLS policies

-- Step 1: Create a security definer function to check video ownership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_video_owner(_video_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.videos
    WHERE id = _video_id
      AND uploaded_by = _user_id
  )
$$;

-- Step 2: Create a security definer function to check child video access without triggering RLS
CREATE OR REPLACE FUNCTION public.has_video_access(_video_id uuid, _child_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.video_child_access
    WHERE video_id = _video_id
      AND child_user_id = _child_user_id
  )
$$;

-- Step 3: Drop the problematic policies
DROP POLICY IF EXISTS "Children can view accessible videos" ON public.videos;
DROP POLICY IF EXISTS "Video owners can manage child access" ON public.video_child_access;

-- Step 4: Recreate policies using security definer functions (no recursion)
CREATE POLICY "Children can view accessible videos"
ON public.videos
FOR SELECT
USING (
  public.has_video_access(id, auth.uid())
  AND (available_from IS NULL OR available_from <= now())
  AND (available_until IS NULL OR available_until >= now())
);

CREATE POLICY "Video owners can manage child access"
ON public.video_child_access
FOR ALL
USING (public.is_video_owner(video_id, auth.uid()))
WITH CHECK (public.is_video_owner(video_id, auth.uid()));