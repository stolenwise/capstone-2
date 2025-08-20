import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from './components/NavBar';
import Shelters from './components/Shelters';

import Swipe from "./components/Swipe/Swipe";
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Home from './components/Home';


function DoglyRoutes() {
  return (
    <div className="App">
      
     <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shelters" element={<Shelters />} />
      <Route path="/dogs" element={<Swipe />} />
      <Route path="/swipe" element={<Navigate to="/dogs" replace />} />
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
          <DoglyRoutes />
        </BrowserRouter>
      </div>
    );
  }
  


export default App;