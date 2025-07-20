-- Fix RLS infinite recursion by dropping and recreating policies

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view users in their location" ON users;
DROP POLICY IF EXISTS "Users can view dogs in their location" ON dogs;
DROP POLICY IF EXISTS "Users can view public events in their location" ON events;
DROP POLICY IF EXISTS "Volunteers can view private events for their dogs" ON events;
DROP POLICY IF EXISTS "Admins can view all events in their location" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Volunteers and admins can manage dogs" ON dogs;

-- Create safer RLS policies without recursion

-- Users table policies (fixed to avoid recursion)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- Dogs table policies (simplified)
CREATE POLICY "Users can view dogs in their location" ON dogs FOR SELECT USING (
  location_id = (
    SELECT location_id FROM users WHERE id = auth.uid() LIMIT 1
  )
);

CREATE POLICY "Volunteers and admins can manage dogs" ON dogs FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('admin', 'volunteer')
    AND location_id = dogs.location_id
  )
);

-- Events table policies (simplified)
CREATE POLICY "Users can view public events in their location" ON events FOR SELECT USING (
  privacy_level = 'public' AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id = (
      SELECT location_id FROM users WHERE id = auth.uid() LIMIT 1
    )
  )
);

CREATE POLICY "Volunteers can view private events for their dogs" ON events FOR SELECT USING (
  privacy_level IN ('public', 'private') AND
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin', 'volunteer')
  ) AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id = (
      SELECT location_id FROM users WHERE id = auth.uid() LIMIT 1
    )
  )
);

CREATE POLICY "Admins can view all events in their location" ON events FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ) AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id = (
      SELECT location_id FROM users WHERE id = auth.uid() LIMIT 1
    )
  )
);

CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id = (
      SELECT location_id FROM users WHERE id = auth.uid() LIMIT 1
    )
  )
);