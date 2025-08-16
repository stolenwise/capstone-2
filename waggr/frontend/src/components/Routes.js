import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import Companies from './components/Companies';
import Jobs from './components/Jobs';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Home from './components/Home';


function JoblyRoutes() {
  return (
    <div className="App">
      
     <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
    </BrowserRouter>

    </div>
  );
}

function App() {
    return (
      <div className="App">
        <BrowserRouter>
          <NavBar />
          <JoblyRoutes />
        </BrowserRouter>
      </div>
    );
  }
  


export default App;