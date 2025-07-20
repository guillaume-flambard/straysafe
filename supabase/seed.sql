-- Seed data for StraySafe

-- Get the Koh Phangan location ID
DO $$
DECLARE
    koh_phangan_id UUID;
BEGIN
    SELECT id INTO koh_phangan_id FROM locations WHERE name = 'Koh Phangan' LIMIT 1;
    
    -- Insert sample dogs
    INSERT INTO dogs (name, gender, status, birth_date, sterilized, location_id, location_text, notes, tags) VALUES
    ('Aisha', 'female', 'fostered', '2024-11-01', false, koh_phangan_id, 'Near the beach', 'Has 6 puppies. Was about to be adopted by Emile, but redirected due to mental health concerns.', ARRAY['mom', 'gentle', 'brown', 'sensitive_case']),
    ('Max', 'male', 'available', '2023-05-15', true, koh_phangan_id, 'Central Thong Sala', 'Friendly dog, good with children. Fully vaccinated.', ARRAY['friendly', 'vaccinated', 'good_with_kids']),
    ('Luna', 'female', 'injured', '2024-01-20', false, koh_phangan_id, 'Haad Rin area', 'Injured leg, currently receiving treatment.', ARRAY['injured', 'needs_medical_care', 'shy']),
    ('Charlie', 'male', 'adopted', '2022-08-10', true, koh_phangan_id, 'Ban Tai', 'Successfully adopted by a local family.', ARRAY['success_story', 'family_dog']),
    ('Bella', 'female', 'available', '2023-12-05', true, koh_phangan_id, 'Haad Yuan', 'Sweet and calm temperament. Looking for a forever home.', ARRAY['calm', 'sweet', 'house_trained']);
    
END $$;