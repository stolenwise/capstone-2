"use strict";
const express = require("express");
const router = new express.Router();

const { PETFINDER_CLIENT_ID, PETFINDER_CLIENT_SECRET } = process.env;
if (!PETFINDER_CLIENT_ID || !PETFINDER_CLIENT_SECRET) {
  throw new Error("Missing PETFINDER_CLIENT_ID or PETFINDER_CLIENT_SECRET");
}

let token = null, tokenExp = 0;
async function getToken() {
  const now = Date.now();
  if (token && now < tokenExp - 30_000) return token;
  const resp = await fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: PETFINDER_CLIENT_ID,
      client_secret: PETFINDER_CLIENT_SECRET
    })
  });
  if (!resp.ok) throw new Error(`Petfinder token failed: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  token = data.access_token;
  tokenExp = Date.now() + data.expires_in * 1000;
  return token;
}

function mapAnimal(a) {
  return {
    id: a.id,
    name: a.name,
    age: a.age,
    size: a.size,
    gender: a.gender,
    coat: a.coat || null,
    color: a.colors?.primary || null,
    breed: a.breeds?.primary ?? (a.breeds?.mixed ? "Mixed" : null),
    city: a.contact?.address?.city || null,
    state: a.contact?.address?.state || null,
    url: a.url,
    tags: a.tags || [],
    attributes: a.attributes || {},
    environment: a.environment || {},
    description: a.description || "",
    photoUrl: a.primary_photo_cropped?.medium || a.photos?.[0]?.medium || null,
    photos: (a.photos || []).map(p => p.medium || p.full).filter(Boolean)
  };
}

router.get("/dogs", async (req, res, next) => {
  try {
    const t = await getToken();
    const allowed = ["location", "page", "distance", "limit", "breed", "gender", "age", "size"];
    const qs = new URLSearchParams({ type: "dog" });
    for (const k of allowed) if (req.query[k]) qs.set(k, String(req.query[k]));
    const pf = await fetch(`https://api.petfinder.com/v2/animals?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${t}` }
    });
    if (!pf.ok) throw new Error(`Petfinder animals failed: ${pf.status} ${await pf.text()}`);
    const data = await pf.json();
    res.json({ dogs: (data.animals || []).map(mapAnimal), pagination: data.pagination || null });
  } catch (e) { next(e); }
});

module.exports = router;
