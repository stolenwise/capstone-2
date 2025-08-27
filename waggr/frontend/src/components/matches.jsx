import React, { useEffect, useState } from "react";
import "./matches.css"; // tiny styles below

export default function Matches() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("waggr_likes") || "[]");
    setDogs(data);
  }, []);

  return (
    <div className="matches-layout">
      {/* LEFT: list of liked dogs */}
      <div className="matches-left">
        <h2>Your Matches</h2>
        {dogs.length === 0 ? (
          <p>No matches yet — go like some pups!</p>
        ) : (
          <ul className="matches-list">
            {dogs.map(d => (
              <li key={d.id} className="match-card">
                {d.photo ? <img src={d.photo} alt={d.name} /> : <div className="placeholder" />}
                <div className="info">
                  <h3>{d.name}</h3>
                  <p>{d.breed}</p>
                  <p>{[d.city, d.state].filter(Boolean).join(", ")}</p>
                  <p className="shelter">Shelter: {d.shelter}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RIGHT: Book a Walk */}
      <aside className="matches-right">
        <div className="book-card">
          <h3>Ready to meet?</h3>
          <a
            className="book-btn"
            href="https://calendly.com/lewis-r-stone/30min"
            target="_blank"
            rel="noreferrer"
          >
            Book a Walk!
          </a>
          <p className="hint">Opens Calendly in a new tab.</p>
        </div>
      </aside>
    </div>
  );
}
