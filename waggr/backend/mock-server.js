require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const SECRET = "dev-mock-secret";
const app = express();
app.use(cors());
app.use(express.json());



const PF_BASE = "https://api.petfinder.com/v2";
let pfToken = null;
let pfTokenExp = 0; // epoch ms

async function getPetfinderToken() {
  const now = Date.now();
  if (pfToken && now < pfTokenExp - 60_000) return pfToken;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.PETFINDER_CLIENT_ID || "",
    client_secret: process.env.PETFINDER_CLIENT_SECRET || ""
  });

  try {
    const { data } = await axios.post(
      `${PF_BASE}/oauth2/token`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 10000 }
    );
    pfToken = data.access_token;
    pfTokenExp = now + (data.expires_in || 3600) * 1000;
    return pfToken;
  } catch (err) {
    console.error("Petfinder token error:", err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
}


/** Fetch dogs from Petfinder and map to our shape */
async function fetchPetfinderDogs({ q, breed, age, size, page = 1, limit = 24, location, distance }) {
  const token = await getPetfinderToken();
  const params = {
    type: "dog",
    q,
    breed,
    age,
    size,
    page,
    limit,
    location,          // e.g., "94110" or "San Jose, CA"
    distance           // miles, e.g., 50
    // You can add more: gender, good_with_children, good_with_dogs, sort, etc.
  };

  // remove undefined params
  Object.keys(params).forEach(k => params[k] == null && delete params[k]);

  const { data } = await axios.get(`${PF_BASE}/animals`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });

  // map into your app’s dog card shape
  const mapped = (data.animals || []).map(a => ({
    id: a.id,
    shelterId: a.organization_id,
    name: a.name,
    breed: a.breeds?.primary || "Unknown",
    age: a.age || "Unknown",
    size: a.size || "Unknown",
    gender: a.gender || "Unknown",
    coat: a.coat || null, // e.g., "Short", "Medium", "Long"
    color: a.colors?.primary || null, // e.g., "White / Cream"
    photoUrl: a.photos?.[0]?.medium || a.primary_photo_cropped?.medium || "",
    photos: (a.photos || [])
      .map(p => p.medium || p.full || p.large || p.small)
      .filter(Boolean),
    city: a.contact?.address?.city || "",
    state: a.contact?.address?.state || "",
    url: a.url,
  
    // extra “About” info
    tags: a.tags || [], // “Affectionate”, “Curious”, …
    attributes: a.attributes || {}, // spayed_neutered, house_trained, shots_current, special_needs
    environment: a.environment || {}, // children, dogs, cats (true/false/null)
    description: a.description || ""
  }));

  return {
    dogs: mapped,
    pagination: data.pagination
  };
}


// ---- In-memory data ----
const users = [
  { username: "demo", password: "password", firstName: "Demo", lastName: "User", email: "demo@waggr.test", applications: [] }
];

const shelters = [
  { id: 1, name: "Paws & Friends", handle: "paws-friends", city: "Portland", state: "OR", website: "https://example.test" },
  { id: 2, name: "Happy Tails", handle: "happy-tails", city: "San Jose", state: "CA", website: "https://example.test" }
];

const dogs = [
  { id: 1, shelterId: 1, name: "Buddy", breed: "Labrador Mix", age: "Young", size: "L", photoUrl: "https://picsum.photos/seed/buddy/600/400" },
  { id: 2, shelterId: 2, name: "Milo",  breed: "Shepherd Mix", age: "Adult", size: "M", photoUrl: "https://picsum.photos/seed/milo/600/400" }
];

let bookings = []; // { id, username, dogId, startAt, endAt, status }

// ---- Auth ----
app.post("/auth/token", (req, res) => {
  const { username, password } = req.body || {};
  const u = users.find(u => u.username === username && u.password === password);
  if (!u) return res.status(400).json({ error: { message: "Invalid username/password" }});
  const token = jwt.sign({ username }, SECRET);
  res.json({ token });
});

app.post("/auth/register", (req, res) => {
  const { username, password, firstName, lastName, email } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: { message: "username/password required" }});
  if (users.some(u => u.username === username)) return res.status(400).json({ error: { message: "username taken" }});
  users.push({ username, password, firstName, lastName, email, applications: [] });
  const token = jwt.sign({ username }, SECRET);
  res.status(201).json({ token });
});

// ---- Users (minimal) ----
app.get("/users/:username", (req, res) => {
  const u = users.find(x => x.username === req.params.username);
  if (!u) return res.status(404).json({ error: { message: "not found" }});
  const user = { username: u.username, firstName: u.firstName, lastName: u.lastName, email: u.email };
  const userBookings = bookings
    .filter(b => b.username === u.username)
    .map(b => ({ ...b, dogName: dogs.find(d => d.id === b.dogId)?.name, shelterName: shelters.find(s => s.id === dogs.find(d => d.id === b.dogId)?.shelterId)?.name }));
  res.json({ user, bookings: userBookings });
});

// ---- Shelters ----
app.get("/shelters", (req, res) => {
  const { nameLike, city } = req.query;
  let results = shelters;
  if (nameLike) results = results.filter(s => s.name.toLowerCase().includes(String(nameLike).toLowerCase()));
  if (city) results = results.filter(s => (s.city || "").toLowerCase() === String(city).toLowerCase());
  res.json({ shelters: results });
});

app.get("/shelters/:id", (req, res) => {
  const id = Number(req.params.id);
  const shelter = shelters.find(s => s.id === id);
  if (!shelter) return res.status(404).json({ error: { message: "Shelter not found" }});
  const shelterDogs = dogs.filter(d => d.shelterId === id);
  res.json({ shelter, dogs: shelterDogs });
});

// ---- Dogs ----
app.get("/dogs", (req, res) => {
  const { q, breed, age, size } = req.query;
  let results = dogs;
  if (q) results = results.filter(d => d.name.toLowerCase().includes(String(q).toLowerCase()) || d.breed.toLowerCase().includes(String(q).toLowerCase()));
  if (breed) results = results.filter(d => d.breed.toLowerCase().includes(String(breed).toLowerCase()));
  if (age) results = results.filter(d => d.age === age);
  if (size) results = results.filter(d => d.size === size);
  res.json({ dogs: results });
});

app.get("/dogs/:id", (req, res) => {
  const id = Number(req.params.id);
  const dog = dogs.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: { message: "Dog not found" }});
  const shelter = shelters.find(s => s.id === dog.shelterId);
  res.json({ dog: { ...dog, shelterId: shelter?.id, shelterName: shelter?.name } });
});

// ---- Bookings (minimal) ----
app.post("/bookings/users/:username/bookings", (req, res) => {
  const { username } = req.params;
  const { dogId, startAt, endAt } = req.body || {};
  const id = bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
  const b = { id, username, dogId: Number(dogId), startAt, endAt, status: "confirmed" };
  bookings.push(b);
  res.status(201).json({ booking: b });
});

app.post("/bookings/users/:username/dogs/:id/book", (req, res) => {
  const { username, id } = req.params;
  const startAt = req.body?.startAt || new Date(Date.now() + 24*60*60*1000).toISOString();
  const durationMin = Number(req.body?.durationMin || 60);
  const endAt = new Date(new Date(startAt).getTime() + durationMin*60000).toISOString();
  const newId = bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
  const b = { id: newId, username, dogId: Number(id), startAt, endAt, status: "confirmed" };
  bookings.push(b);
  res.status(201).json({ booked: newId });
});


// ---PetFinder API---

// GET /pf/dogs  -> live Petfinder results (proxy)
app.get("/pf/dogs", async (req, res) => {
  try {
    const { q, breed, age, size, page, limit, location, distance } = req.query;
    const results = await fetchPetfinderDogs({ q, breed, age, size, page, limit, location, distance });
    res.json(results);
  } catch (err) {
    console.error("Petfinder error:", err?.response?.data || err.message);
    res.status(502).json({ error: { message: "Petfinder upstream error" }});
  }
});


const PORT = 3001;
app.listen(PORT, () => console.log(`Mock Waggr API running on http://localhost:${PORT}`));


