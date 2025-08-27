import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// These two likely exist as PascalCase (adjust if needed)
import NavBar from "./components/NavBar";
import ApiTest from "./components/ApiTest";

// These four appear to be lowercase on disk
import ShelterList from "./components/Shelter/shelterlist";
import ShelterDetails from "./components/Shelter/shelterdetails";
import DogList from "./components/Dogs/doglist";
import DogDetails from "./components/Dogs/dogdetails";
import PetfinderTest from "./components/petfindertest";
import SwipeCards from "./components/swipecard";
import SwipeDeck from "./components/swipedeck";
import Matches from "./components/matches";




import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useLocalStorage from "./hooks/useLocalStorage";

// Api.js is capitalized on disk
import DoglyApi from "./api";

// Auth files are lowercase on disk
import LoginForm from "./components/Auth/loginform";
import SignupForm from "./components/Auth/signupform";
import ProfileForm from "./components/Auth/profileform";
import ProfileView from "./components/Auth/profileview";

// Home is lowercase on disk
import Home from "./home";

// RequireAuth is lowercase and .jsx on disk
import RequireAuth from "./components/Auth/requireauth";

// NotFound is lowercase on disk
import NotFound from "./components/notfound";


function App() {
  const [token, setToken] = useLocalStorage("token", null);
  const [currentUser, setCurrentUser] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState(false);

// keep DoglyApi in sync
useEffect(() => {
  DoglyApi.token = token || null;

  async function loadUser() {
    setInfoLoaded(false);                // start loading
    try {
      if (!token) { setCurrentUser(null); return; }
      const { username } = jwtDecode(token);
      const user = await DoglyApi.getCurrentUser(username); // returns res.user
      setCurrentUser(user);
    } catch (err) {
      console.error("loadUser failed", err);
      setCurrentUser(null);
    } finally {
      setInfoLoaded(true);               // done loading
    }
  }
  loadUser();
}, [token]);

  async function signup(data) {
    const t = await DoglyApi.signup(data);
    setToken(t);                  // persists via useLocalStorage
  
    // set user right away instead of waiting for useEffect
    DoglyApi.token = t;
    const { username } = jwtDecode(t);
    const user = await DoglyApi.getCurrentUser(username);
    setCurrentUser(user);
  }
  
  async function login(credentials) {
    const t = await DoglyApi.login(credentials);
    setToken(t);
  
    DoglyApi.token = t;
    const { username } = jwtDecode(t);
    const user = await DoglyApi.getCurrentUser(username);
    setCurrentUser(user);
  }
  
  function logout() {
    setToken(null);
    setCurrentUser(null);
  }

  async function updateProfile(formData) {
    try {
      // username comes from currentUser
      const updated = await DoglyApi.saveProfile(currentUser.username, formData);
      setCurrentUser(updated);            // reflect changes app-wide
      return { success: true };
    } catch (errs) {
      // errs is an array from your request helper
      return { success: false, errs };
    }
  }


  function hasAppliedToDog(dogId) {
    if (!currentUser) return false;
    const ids = currentUser.applications
      || (currentUser.dogs ? currentUser.dogs.map(j => j.id) : []);
    return ids.includes(dogId);
  }
  
  async function applyToDog(dogId) {
    if (!currentUser || hasAppliedToDog(dogId)) return;
  
    setCurrentUser(u => {
      const ids = u.applications || (u.dogs ? u.dogs.map(j => j.id) : []);
      return { ...u, applications: [...ids, dogId] }; // triggers re-render everywhere
    });
  
    try {
      await DoglyApi.applyToDog(currentUser.username, dogId);
    } catch (err) {
      // rollback on error
      setCurrentUser(u => {
        const ids = u.applications || (u.dogs ? u.dogs.map(j => j.id) : []);
        return { ...u, applications: ids.filter(id => id !== dogId) };
      });
      console.error("applyToDog failed:", err);
    }
  }
  



  // Wait until currentUser data (or null) is loaded before showing anything
  if (!infoLoaded) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <div className="App">
      <BrowserRouter>
        {infoLoaded && <NavBar currentUser={currentUser} logout={logout} />}
        <main>
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<LoginForm login={login} />} />
          <Route path="/signup" element={<SignupForm signup={signup} />} />
          <Route path="/" element={<Home currentUser={currentUser} />} />
          <Route path="/test" element={<ApiTest />} />
          <Route path="*" element={<NotFound/>} />

          {/* protected routes */}
        <Route element={<RequireAuth currentUser={currentUser} infoLoaded={infoLoaded} />}>
          <Route path="/profile" element={<ProfileView currentUser={currentUser} />} />
          <Route path="/edit-profile" element={<ProfileForm currentUser={currentUser} updateProfile={updateProfile} />} />  <Route path="/shelters" element={<ShelterList />} />
          <Route path="/dogs" element={<Navigate to="/swipe" replace />}/>
          <Route path="/shelters/:handle" element={<ShelterDetails hasAppliedToDog={hasAppliedToDog} applyToDog={applyToDog} />}/>
          <Route path="/dogs/:id" element={<DogDetails />} />
          <Route path="/pf-test" element={<PetfinderTest />} />
          <Route path="matches" element={<Matches />} />

          <Route path="/swipe" element={<SwipeDeck />} />
        </Route>
     

        </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
