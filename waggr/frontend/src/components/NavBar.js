import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import logo from "../assets/waggr-logo-5-3E00B8.png";

function Navbar({ currentUser, logout, clearMatches}) {
  const styles = {
    brand: {
      display: "flex",
      alignItems: "center",    // vertical alignment
      gap: 8,                  // spacing between logo and text
    },
    logo: {
      width: 50,
      height: 50,
      fill: "#3E00B8",         // works if SVG
      color: "#3E00B8",        // fallback for icon fonts
    },
    brandText: {
      fontSize: 24,
      fontWeight: 700,
      color: "#3E00B8",        // your purple
    }
  };


  const handleLogout = () => {
    logout(); // Your existing logout function
    clearMatches(); // Clear matches when logging out
  };

  return (
    <nav className="Navbar">

      {/* Left side */}
      <div className="Navbar-left">
        <Link to="/" className="Navbar-logo">
        <div style={styles.brand}>
        <img src={logo} alt="Waggr logo" style={styles.logo} />
        <span style={styles.brandText}>Waggr</span>
        </div></Link>
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
