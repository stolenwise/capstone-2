// src/components/Shelter/ShelterCard.js
import React from "react";
import { Link } from "react-router-dom";
import "./sheltercard.css";

function ShelterCard({ handle, name, description, logoUrl }) {
  return (
    <div className="ShelterCard">
      <Link className="ShelterCard-link" to={`/shelters/${handle}`}>
        <div className="ShelterCard-content">
          <div className="ShelterCard-text">
            <h3>{name}</h3>
            <p>{description}</p>
            </div>
        </div>
      </Link>
    </div>
  );
}

export default ShelterCard;
