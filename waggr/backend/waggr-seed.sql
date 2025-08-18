-- waggr-seed.sql
-- Seed data for Waggr project
-- Note: test users both use the plaintext password "password"

-- =========================
-- USERS
-- =========================
INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES 
  ('testuser',
   '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',  -- "password"
   'Test', 'User', 'testuser@example.com', FALSE),
  ('testadmin',
   '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',  -- "password"
   'Test', 'Admin', 'admin@example.com', TRUE);

-- =========================
-- SHELTERS
-- =========================
INSERT INTO shelters (handle, name, num_employees, description, logo_url)
VALUES
  ('happy-paws', 'Happy Paws Rescue', 25, 'Small rescue dedicated to rehoming dogs in need.', '/logos/logo1.png'),
  ('second-chance', 'Second Chance Shelter', 40, 'Giving dogs a second chance at life.', '/logos/logo2.png'),
  ('city-shelter', 'City Animal Shelter', 100, 'Municipal shelter serving the metro area.', '/logos/logo3.png'),
  ('green-haven', 'Green Haven Rescue', 15, 'Eco-friendly shelter focused on sustainable pet care.', '/logos/logo4.png'),
  ('pup-place', 'The Pup Place', 8, 'Boutique shelter for small dog breeds.', NULL);

-- =========================
-- DOGS
-- =========================
INSERT INTO dogs (petfinder_id, name, age_years, breed, house_trained, health, description, photo_url, shelter_handle)
VALUES
  ('pf_1001', 'Buddy', 2, 'Golden Retriever', TRUE, 'Vaccinated, Neutered', 'Friendly and loves long walks.', '/photos/dog1.png', 'happy-paws'),
  ('pf_1002', 'Luna', 1, 'German Shepherd', TRUE, 'Vaccinated', 'Energetic and needs an active owner.', '/photos/dog2.png', 'second-chance'),
  ('pf_1003', 'Milo', 4, 'Beagle', FALSE, 'Vaccinated', 'Sweet but still learning house manners.', '/photos/dog3.png', 'city-shelter'),
  ('pf_1004', 'Daisy', 3, 'Labrador Mix', TRUE, 'Spayed, Vaccinated', 'Gentle with kids and loves to play fetch.', '/photos/dog3.png', 'green-haven'),
  ('pf_1005', 'Rocky', 5, 'Bulldog', TRUE, 'Neutered', 'Chill personality, great for apartments.', '/photos/dog4.png', 'pup-place'),
  ('pf_1006', 'Bella', 2, 'Border Collie', TRUE, 'Vaccinated', 'High-energy herding dog, very smart.', '/photos/dog5.png', 'happy-paws'),
  ('pf_1007', 'Max', 7, 'Poodle', TRUE, 'Neutered, Vaccinated', 'Senior dog looking for a calm home.', '/photos/dog6.png', 'second-chance');

-- =========================
-- MATCHES (swipes/likes)
-- =========================
INSERT INTO matches (username, dog_id, status)
VALUES
  ('testuser', 1, 'liked'),
  ('testuser', 2, 'passed'),
  ('testadmin', 1, 'matched'),
  ('testadmin', 3, 'bookmarked');

-- =========================
-- BOOKINGS (walk appointments)
-- =========================
INSERT INTO bookings (username, dog_id, start_at, duration_minutes, status, notes)
VALUES
  ('testuser', 1, NOW() + interval '1 day', 60, 'requested', 'First walk with Buddy'),
  ('testuser', 4, NOW() + interval '2 days', 45, 'approved', 'Daisy is ready for a playdate'),
  ('testadmin', 5, NOW() + interval '3 days', 30, 'completed', 'Rocky was calm and friendly');
