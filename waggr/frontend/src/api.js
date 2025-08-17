import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class: centralizes all requests */
class DoglyApi {
  // JWT lives here if you choose to use it later
  static token = null;

  static async request(endpoint, data = {}, method = "get") {
    const url = `${BASE_URL}/${endpoint}`;
    const headers = DoglyApi.token
      ? { Authorization: `Bearer ${DoglyApi.token}` }
      : {};
    const params = method === "get" ? data : undefined;

    try {
      const resp = await axios({ url, method, data, params, headers });
      return resp.data;
    } catch (err) {
      console.error("API Error:", err);
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Network error";
      throw Array.isArray(message) ? message : [message];
    }
  }

  /** ---------- Shelters ---------- */

  // In your mock server, shelter route is /shelters/:id (numeric),
  // not handle. Adjust as needed if you later add handles.
  static async getShelter(id) {
    const res = await this.request(`shelters/${id}`);
    return res.shelter; // { id, name, ... }
  }

  // Supports ?nameLike= and ?city= per mock-server.js
  static async getShelters(filters = {}) {
    const params = {};
    if (filters.nameLike) params.nameLike = filters.nameLike;
    if (filters.city) params.city = filters.city;
    const res = await this.request("shelters", params);
    return res.shelters; // array
  }

  /** ------------ Dogs ------------- */

  // Your mock supports q, breed, age, size
  static async getDogs(filters = {}) {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.breed) params.breed = filters.breed;
    if (filters.age) params.age = filters.age; // e.g., "Young", "Adult"
    if (filters.size) params.size = filters.size; // e.g., "S","M","L"
    const res = await this.request("dogs", params);
    return res.dogs; // array
  }

  static async getDog(id) {
    const res = await this.request(`dogs/${id}`);
    return res.dog; // { ...dog, shelterName }
  }

  /** ----------- Auth ------------- */

  static async login(credentials) {
    const res = await this.request("auth/token", credentials, "post");
    return res.token;
  }

  static async signup(data) {
    const res = await this.request("auth/register", data, "post");
    return res.token;
  }

  static async getCurrentUser(username) {
    const res = await this.request(`users/${username}`);
    // mock returns { user, bookings }
    return res;
  }

  // NOTE: saveProfile is NOT implemented in the mock server.
  // Keep this here for future real backend:
  static async saveProfile(username, data) {
    const res = await this.request(`users/${username}`, data, "patch");
    return res.user;
  }

  /** --------- Bookings ---------- */

  // Matches mock: POST /bookings/users/:username/dogs/:id/book
  static async bookDog(username, dogId, { startAt, durationMin } = {}) {
    const res = await this.request(
      `bookings/users/${username}/dogs/${dogId}/book`,
      { startAt, durationMin },
      "post"
    );
    // mock returns { booked: newId }
    return res.booked;
  }

  /** ------ Petfinder proxy ------- */

  // GET /pf/dogs proxied by backend (uses backend env secrets)
  static async getPetfinderDogs(params = {}) {
    const res = await this.request("pf/dogs", params, "get");
    // { dogs: [...], pagination: {...} }
    return res;
  }
}

// Optional: set token here later if you add JWT auth
DoglyApi.token = null;

export default DoglyApi;
