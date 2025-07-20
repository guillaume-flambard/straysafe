-- Ajouter d'autres localisations pour tester le changement de lieu

INSERT INTO locations (name, country) VALUES 
('Bangkok', 'Thailand'),
('Chiang Mai', 'Thailand'),
('Phuket', 'Thailand'),
('Bali', 'Indonesia'),
('Athens', 'Greece');

-- Ajouter quelques chiens à Bangkok pour tester
DO $$
DECLARE
    bangkok_id UUID;
BEGIN
    SELECT id INTO bangkok_id FROM locations WHERE name = 'Bangkok' LIMIT 1;
    
    -- Insert sample dogs for Bangkok
    INSERT INTO dogs (name, gender, status, birth_date, sterilized, location_id, location_text, notes, tags) VALUES
    ('Mango', 'male', 'available', '2023-03-10', true, bangkok_id, 'Chatuchak area', 'Very social dog, loves playing with other dogs.', ARRAY['friendly', 'playful', 'city_dog']),
    ('Nong', 'female', 'fostered', '2024-02-14', false, bangkok_id, 'Sukhumvit', 'Calm dog, perfect for apartments.', ARRAY['calm', 'apartment_friendly', 'gentle']);
    
END $$;
