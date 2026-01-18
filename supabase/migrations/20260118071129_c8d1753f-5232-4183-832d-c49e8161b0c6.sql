-- Add PIN column to profiles for child accounts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- Add column to track if a profile is a child created by a parent
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_by_parent UUID REFERENCES auth.users(id);

-- Create index for faster child lookups by parent
CREATE INDEX IF NOT EXISTS idx_profiles_created_by_parent ON public.profiles(created_by_parent);

-- Drop old child signup policies since children won't sign up directly anymore
-- Parents will create child profiles instead

-- Create policy for parents to insert child profiles
DROP POLICY IF EXISTS "Parents can create child profiles" ON public.profiles;
CREATE POLICY "Parents can create child profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = created_by_parent AND is_parent = false
);

-- Parents can view child profiles they created
DROP POLICY IF EXISTS "Parents can view created children" ON public.profiles;
CREATE POLICY "Parents can view created children"
ON public.profiles
FOR SELECT
USING (
  created_by_parent = auth.uid()
);

-- Parents can update child profiles they created
DROP POLICY IF EXISTS "Parents can update created children" ON public.profiles;
CREATE POLICY "Parents can update created children"
ON public.profiles
FOR UPDATE
USING (
  created_by_parent = auth.uid()
);

-- Parents can delete child profiles they created
DROP POLICY IF EXISTS "Parents can delete created children" ON public.profiles;
CREATE POLICY "Parents can delete created children"
ON public.profiles
FOR DELETE
USING (
  created_by_parent = auth.uid()
);