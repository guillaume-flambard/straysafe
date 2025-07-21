-- Fix storage bucket policies for 'dogs-photos' bucket
-- Run this in Supabase SQL editor

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('dogs-photos', 'dogs-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Anyone can view dogs photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload dogs photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update dogs photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete dogs photos" ON storage.objects;

-- Create storage policies for dogs-photos bucket
CREATE POLICY "Anyone can view dogs photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dogs-photos');

CREATE POLICY "Authenticated users can upload dogs photos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'dogs-photos');

CREATE POLICY "Authenticated users can update dogs photos" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'dogs-photos');

CREATE POLICY "Authenticated users can delete dogs photos" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'dogs-photos');