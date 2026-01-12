-- Add email column to profiles for child account linking
ALTER TABLE public.profiles 
ADD COLUMN email text;

-- Create index for email lookup
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Allow parents to view child profiles for linking (read only display_name and email)
CREATE POLICY "Parents can view child profiles for linking"
ON public.profiles
FOR SELECT
USING (
  is_parent = false AND 
  EXISTS (
    SELECT 1 FROM profiles parent_profile 
    WHERE parent_profile.user_id = auth.uid() 
    AND parent_profile.is_parent = true
  )
);

-- Update handle_new_user function to store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, is_parent)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Little Star'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'is_parent')::boolean, false)
  );
  RETURN NEW;
END;
$function$;