-- Shelters
CREATE TABLE shelters (
  handle VARCHAR(25) PRIMARY KEY CHECK (handle = lower(handle)),
  name TEXT UNIQUE NOT NULL,
  num_employees INTEGER CHECK (num_employees >= 0),
  description TEXT NOT NULL,
  logo_url TEXT
);

-- Users
CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY CHECK (username = lower(username)),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Dogs (replaces Jobly's jobs)
CREATE TABLE dogs (
  id SERIAL PRIMARY KEY,
  petfinder_id TEXT UNIQUE,                -- optional cache/id from API
  name TEXT NOT NULL,
  age_years INTEGER CHECK (age_years >= 0),
  breed TEXT,
  house_trained BOOLEAN,
  health TEXT,                             -- e.g. "vaccinated, spayed/neutered"
  description TEXT,
  photo_url TEXT,
  shelter_handle VARCHAR(25) NOT NULL
    REFERENCES shelters(handle) ON DELETE CASCADE
);

CREATE INDEX idx_dogs_shelter_handle ON dogs(shelter_handle);

-- Matches (swipes): record a user's action on a dog
-- status: liked | passed | bookmarked | matched
-- 'matched' can be set by your app when a shelter approves or
-- when your business logic decides a "match" has occurred.
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) NOT NULL
    REFERENCES users(username) ON DELETE CASCADE,
  dog_id INTEGER NOT NULL
    REFERENCES dogs(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('liked','passed','bookmarked','matched')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (username, dog_id)                -- one row per user↔dog
);

CREATE INDEX idx_matches_user ON matches(username);
CREATE INDEX idx_matches_dog ON matches(dog_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Bookings: actual scheduled walk requests/appointments
CREATE TABLE bookings (
  username VARCHAR(25) NOT NULL
    REFERENCES users(username) ON DELETE CASCADE,
  dog_id INTEGER NOT NULL
    REFERENCES dogs(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  status TEXT NOT NULL CHECK (status IN ('requested','approved','declined','cancelled','completed')),
  notes TEXT,
  PRIMARY KEY (username, dog_id, start_at)
);

CREATE INDEX idx_bookings_user_time ON bookings(username, start_at);
CREATE INDEX idx_bookings_dog_time ON bookings(dog_id, start_at);
