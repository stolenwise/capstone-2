import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import logo from "../assets/waggr-logo-5.png";

function Navbar({ currentUser, logout, clearMatches}) {

  const handleLogout = () => {
    logout(); // Your existing logout function
    clearMatches(); // Clear matches when logging out
  };

  return (
    <nav className="Navbar">

      {/* Left side */}
      <div className="Navbar-left">
        <Link to="/" className="Navbar-logo">Waggr</Link>
      </div>

      {/* Center logo */}
      <div className="Navbar-center">
        <Link to="/">
          <img src={logo} alt="Waggr Logo" className="Logo-img" />
        </Link>
      </div>

      {/* Right side */}
      <div className="Navbar-right">
        <Link to="/dogs">Dogs</Link>
        <Link to="/matches">Matches</Link>

        {currentUser ? (
          <div className="Navbar-user">
            <span>
              Hi, <Link to="/profile" className="username-link">
                {currentUser?.username ?? currentUser?.user?.username ?? ""}
              </Link>
            </span>
            <button className="Navbar-logout" onClick={handleLogout}>Log out</button>
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
