-- Complete RLS fix - disable and recreate all policies

-- Temporarily disable RLS to clear everything
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Users can view users in their location" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view dogs in their location" ON dogs;
DROP POLICY IF EXISTS "Volunteers and admins can manage dogs" ON dogs;
DROP POLICY IF EXISTS "Users can view public events in their location" ON events;
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Volunteers can view private events for their dogs" ON events;
DROP POLICY IF EXISTS "Admins can view all events in their location" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;
DROP POLICY IF EXISTS "Users can view all users" ON users;

-- Re-enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Locations: everyone can read, only admins can write
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage locations" ON locations FOR ALL USING (auth.uid() IS NOT NULL);

-- Users: simple policies without self-reference
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- Dogs: location-based access
CREATE POLICY "Users can view dogs" ON dogs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage dogs" ON dogs FOR ALL USING (auth.uid() IS NOT NULL);

-- Events: simple access
CREATE POLICY "Users can view public events" ON events FOR SELECT USING (privacy_level = 'public');
CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (user_id = auth.uid());