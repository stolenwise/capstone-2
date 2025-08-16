import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar";
import ApiTest from "./components/apitest";
import CompanyList from "./components/Company/companylist";
import CompanyDetails from "./components/Company/companydetails";
import JobList from "./components/Jobs/joblist";
import JobDetails from "./components/Jobs/jobdetails";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useLocalStorage from "./hooks/useLocalStorage";
import JoblyApi from "./api";
import LoginForm from "./components/Auth/loginform";
import SignupForm from "./components/Auth/signupform";
import ProfileForm from "./components/Auth/profileform";
import ProfileView from "./components/Auth/profileview";
import Home from "./home.js";
import RequireAuth from "./components/Auth/requireauth";
import NotFound from "./components/notfound";



function App() {
  const [token, setToken] = useLocalStorage("jobly-token", null);
  const [currentUser, setCurrentUser] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState(false);

  useEffect(() => {
    async function loadUser() {
      setInfoLoaded(false);
      try {
        if (token) {
          JoblyApi.token = token;
          const { username } = jwtDecode(token);
          const user = await JoblyApi.getCurrentUser(username);
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("loadUser failed", err);
        setCurrentUser(null);
      } finally {
        setInfoLoaded(true);
      }
    }
    loadUser();
  }, [token]);

  async function signup(data) {
    const t = await JoblyApi.signup(data);
    setToken(t);                  // persists via useLocalStorage
  
    // set user right away instead of waiting for useEffect
    JoblyApi.token = t;
    const { username } = jwtDecode(t);
    const user = await JoblyApi.getCurrentUser(username);
    setCurrentUser(user);
  }
  
  async function login(credentials) {
    const t = await JoblyApi.login(credentials);
    setToken(t);
  
    JoblyApi.token = t;
    const { username } = jwtDecode(t);
    const user = await JoblyApi.getCurrentUser(username);
    setCurrentUser(user);
  }
  
  function logout() {
    setToken(null);
    setCurrentUser(null);
  }

  async function updateProfile(formData) {
    try {
      // username comes from currentUser
      const updated = await JoblyApi.saveProfile(currentUser.username, formData);
      setCurrentUser(updated);            // reflect changes app-wide
      return { success: true };
    } catch (errs) {
      // errs is an array from your request helper
      return { success: false, errs };
    }
  }


  function hasAppliedToJob(jobId) {
    if (!currentUser) return false;
    const ids = currentUser.applications
      || (currentUser.jobs ? currentUser.jobs.map(j => j.id) : []);
    return ids.includes(jobId);
  }
  
  async function applyToJob(jobId) {
    if (!currentUser || hasAppliedToJob(jobId)) return;
  
    setCurrentUser(u => {
      const ids = u.applications || (u.jobs ? u.jobs.map(j => j.id) : []);
      return { ...u, applications: [...ids, jobId] }; // triggers re-render everywhere
    });
  
    try {
      await JoblyApi.applyToJob(currentUser.username, jobId);
    } catch (err) {
      // rollback on error
      setCurrentUser(u => {
        const ids = u.applications || (u.jobs ? u.jobs.map(j => j.id) : []);
        return { ...u, applications: ids.filter(id => id !== jobId) };
      });
      console.error("applyToJob failed:", err);
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
          <Route path="/edit-profile" element={<ProfileForm currentUser={currentUser} updateProfile={updateProfile} />} />  <Route path="/companies" element={<CompanyList />} />
          <Route path="/jobs" element={<JobList hasAppliedToJob={hasAppliedToJob} applyToJob={applyToJob} />}/>
          <Route path="/companies/:handle" element={<CompanyDetails hasAppliedToJob={hasAppliedToJob} applyToJob={applyToJob} />}/>
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Route>
     

        </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
