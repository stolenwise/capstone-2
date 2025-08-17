import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

function Navbar({ currentUser, logout }) {
  return (
    <nav className="Navbar">
      <div className="Navbar-left">
        <Link to="/" className="Navbar-logo">Waggr</Link>
      </div>

      <div className="Navbar-right">
        <Link to="/shelters">Shelters</Link>
        <Link to="/dogs">Dogs</Link>

        {currentUser ? (
  <div className="Navbar-user">
    <span>
  Hi, <Link to="/profile" className="username-link"> {currentUser.username}</Link>
</span>
    <button className="Navbar-logout" onClick={logout}>Log out</button>
  </div>
) : (
  <>
    <Link to="/login">Log In</Link>
    <Link to="/signup">Sign Up</Link>
  </>
)}

      </div>
    </nav>
  );
}

export default Navbar;


