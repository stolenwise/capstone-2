// src/components/Jobs/jobcards.js
import React from "react";
import { Link } from "react-router-dom";
import "./jobcards.css";

export default function JobCard({
  id, title, salary, equity, companyName,
  hasAppliedToJob, applyToJob
}) {
  const applied = hasAppliedToJob ? hasAppliedToJob(id) : false;

  async function handleApply() {
    if (!applied && applyToJob) {
      await applyToJob(id);        // App updates currentUser -> both pages re-render
    }
  }

  return (
    <div className="JobCard">
      <div className="JobCard-main">
        <h3><Link to={`/jobs/${id}`}>{title}</Link></h3>
        {companyName && <p className="JobCard-company">{companyName}</p>}
      </div>

      <div className="JobCard-meta">
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

