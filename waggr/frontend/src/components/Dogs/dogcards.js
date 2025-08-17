// src/components/Dogs/dogcards.js
import React from "react";
import { Link } from "react-router-dom";
import "./dogcards.css";

export default function DogCard({
  id, title, salary, equity, shelterName,
  hasAppliedToDog, applyToDog
}) {
  const applied = hasAppliedToDog ? hasAppliedToDog(id) : false;

  async function handleApply() {
    if (!applied && applyToDog) {
      await applyToDog(id);        // App updates currentUser -> both pages re-render
    }
  }

  return (
    <div className="DogCard">
      <div className="DogCard-main">
        <h3><Link to={`/dogs/${id}`}>{title}</Link></h3>
        {shelterName && <p className="DogCard-shelter">{shelterName}</p>}
      </div>

      <div className="DogCard-meta">
        <p>Salary: {salary ?? "—"}</p>
        <p>Equity: {equity ?? "—"}</p>
        <button
          className={`ApplyBtn ${applied ? "is-applied" : ""}`}
          onClick={handleApply}
          disabled={applied}
        >
          {applied ? "Applied" : "Apply"}
        </button>
      </div>
    </div>
  );
}

