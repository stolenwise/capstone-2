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


    // Call the Petfinder proxy, not /dogs
    static async getPetfinderDogs(params = {}) {
      // --- flip this to false once your backend /pf is wired ---
      const USE_MOCK = false;
  
      if (USE_MOCK) {
        const resp = await fetch("/mock/dogs.json");
        if (!resp.ok) throw new Error("mock dogs failed");
        return resp.json();  // { dogs, pagination }
      }
  
      return this.request("pf/dogs", params); // expects { dogs, pagination }
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

// In your login function
static async login(credentials) {
  const res = await this.request("auth/token", credentials, "post");
  this.token = res.token; // Make sure this is set
  return res.token;
}

  static async signup(data) {
    const res = await this.request("auth/register", data, "post");
    return res.token;
  }

  static async getCurrentUser(username) {
    const res = await this.request(`users/${username}`);
    // mock returns { user, bookings }
    return res.user;
  }

  // NOTE: saveProfile is NOT implemented in the mock server.
  // Keep this here for future real backend:
  static async saveProfile(username, data) {
    // The token should be automatically included via the headers
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
}

// Optional: set token here later if you add JWT auth
DoglyApi.token = null;

export default DoglyApi;
