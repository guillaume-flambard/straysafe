-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'volunteer', 'vet', 'viewer')) DEFAULT 'viewer',
  location_id UUID NOT NULL REFERENCES locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dogs table
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'unknown')),
  status TEXT NOT NULL CHECK (status IN ('fostered', 'available', 'adopted', 'injured', 'missing', 'hidden', 'deceased')),
  birth_date DATE,
  sterilized BOOLEAN DEFAULT FALSE,
  location_id UUID NOT NULL REFERENCES locations(id),
  location_text TEXT,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  rescue_date DATE,
  rescuer_id UUID REFERENCES users(id),
  foster_id UUID REFERENCES users(id),
  vet_id UUID REFERENCES users(id),
  adopter_id UUID REFERENCES users(id),
  photo_url TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('vet', 'adoption', 'transfer', 'note', 'incident')),
  title TEXT NOT NULL,
  description TEXT,
  privacy_level TEXT NOT NULL CHECK (privacy_level IN ('public', 'private', 'sensitive')) DEFAULT 'public',
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for dogs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial location (Koh Phangan)
INSERT INTO locations (name, country) VALUES ('Koh Phangan', 'Thailand');

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, location_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'location_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
CREATE POLICY "Users can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON locations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- RLS Policies for users
CREATE POLICY "Users can view users in their location" ON users FOR SELECT USING (
  location_id IN (
    SELECT location_id FROM users WHERE id = auth.uid()
  )
);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- RLS Policies for dogs
CREATE POLICY "Users can view dogs in their location" ON dogs FOR SELECT USING (
  location_id IN (
    SELECT location_id FROM users WHERE id = auth.uid()
  )
);
CREATE POLICY "Volunteers and admins can manage dogs" ON dogs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'volunteer')
    AND users.location_id = dogs.location_id
  )
);

-- RLS Policies for events
CREATE POLICY "Users can view public events in their location" ON events FOR SELECT USING (
  privacy_level = 'public' AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id IN (
      SELECT location_id FROM users WHERE id = auth.uid()
    )
  )
);
CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Volunteers can view private events for their dogs" ON events FOR SELECT USING (
  privacy_level IN ('public', 'private') AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'volunteer')
  ) AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id IN (
      SELECT location_id FROM users WHERE id = auth.uid()
    )
  )
);
CREATE POLICY "Admins can view all events in their location" ON events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ) AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id IN (
      SELECT location_id FROM users WHERE id = auth.uid()
    )
  )
);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  dog_id IN (
    SELECT id FROM dogs 
    WHERE location_id IN (
      SELECT location_id FROM users WHERE id = auth.uid()
    )
  )
);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all events" ON events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);