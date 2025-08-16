// src/components/Company/CompanyCard.js
import React from "react";
import { Link } from "react-router-dom";
import "./companycard.css";

function CompanyCard({ handle, name, description, logoUrl }) {
  return (
    <div className="CompanyCard">
      <Link className="CompanyCard-link" to={`/companies/${handle}`}>
        <div className="CompanyCard-content">
          <div className="CompanyCard-text">
            <h3>{name}</h3>
            <p>{description}</p>
            </div>
        </div>
      </Link>
    </div>
  );
}

export default CompanyCard;
