-- Safely delete child profiles and their associated auth users
CREATE OR REPLACE FUNCTION public.delete_child_profile(p_child_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- 1. Check if the authenticated user is the creator of this child profile
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_child_id 
    AND (created_by_parent = auth.uid() OR user_id = auth.uid())
  ) THEN
    -- Fallback: check if they are linked as a parent
    IF NOT EXISTS (
      SELECT 1 FROM public.parent_child_links 
      WHERE parent_user_id = auth.uid() 
      AND child_user_id = (SELECT user_id FROM public.profiles WHERE id = p_child_id)
    ) THEN
        RAISE EXCEPTION 'Not authorized to delete this profile';
    END IF;
  END IF;

  -- 2. Delete the auth user (this will cascade to profiles if set up correctly)
  -- If not, we delete manually below
  DELETE FROM auth.users WHERE id = (SELECT user_id FROM public.profiles WHERE id = p_child_id);
  
  -- 3. Explicitly delete from profiles if cascade failed
  DELETE FROM public.profiles WHERE id = p_child_id;
  
  -- 4. Delete from parent_child_links (just in case)
  DELETE FROM public.parent_child_links WHERE child_user_id = (SELECT user_id FROM public.profiles WHERE id = p_child_id) OR parent_user_id = (SELECT user_id FROM public.profiles WHERE id = p_child_id);
END;
$$;

-- Allow parents to delete profiles they created (required for direct profile deletion)
DROP POLICY IF EXISTS "Parents can delete child profiles" ON public.profiles;
CREATE POLICY "Parents can delete child profiles"
ON public.profiles FOR DELETE
USING (created_by_parent = auth.uid());
