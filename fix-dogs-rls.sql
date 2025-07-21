-- Quick fix for dogs RLS policy that's causing the insertion error
-- This replaces the complex policy with a simple one that allows authenticated users to manage dogs

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Volunteers and admins can manage dogs" ON dogs;

-- Create a simple policy that allows any authenticated user to manage dogs
CREATE POLICY "Authenticated users can manage dogs" ON dogs FOR ALL USING (auth.uid() IS NOT NULL);