CREATE TABLE shelters (
  handle VARCHAR(25) PRIMARY KEY CHECK (handle = lower(handle)),
  name TEXT UNIQUE NOT NULL,
  num_employees INTEGER CHECK (num_employees >= 0),
  description TEXT NOT NULL,
  logo_url TEXT
);

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE dogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary INTEGER CHECK (salary >= 0),
  equity NUMERIC CHECK (equity <= 1.0),
  shelter_handle VARCHAR(25) NOT NULL
    REFERENCES shelters ON DELETE CASCADE
);

CREATE TABLE bookings (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  dog_id INTEGER
    REFERENCES dogs ON DELETE CASCADE,
  PRIMARY KEY (username, dog_id)
);
