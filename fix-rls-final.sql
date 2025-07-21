-- Final RLS fix for dogs table - ensure clean state and simple policy

-- First, drop ALL existing policies on dogs table
DROP POLICY IF EXISTS "Users can view dogs in their location" ON dogs;
DROP POLICY IF EXISTS "Volunteers and admins can manage dogs" ON dogs;
DROP POLICY IF EXISTS "Authenticated users can manage dogs" ON dogs;
DROP POLICY IF EXISTS "Users can view dogs" ON dogs;

-- Create very simple policies that should definitely work
CREATE POLICY "Anyone can view dogs" ON dogs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert dogs" ON dogs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update dogs" ON dogs FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete dogs" ON dogs FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify RLS is enabled
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;