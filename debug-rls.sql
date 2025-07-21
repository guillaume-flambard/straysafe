-- Debug current RLS policies for dogs table
-- Run this to see what policies are currently active

-- Check all policies on the dogs table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'dogs';

-- Check if RLS is enabled on dogs table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'dogs' AND schemaname = 'public';

-- Check current user's auth status and profile
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_email,
  u.role,
  u.location_id,
  l.name as location_name
FROM users u
LEFT JOIN locations l ON u.location_id = l.id
WHERE u.id = auth.uid();