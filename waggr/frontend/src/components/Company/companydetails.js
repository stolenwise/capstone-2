// src/components/Company/companydetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JoblyApi from "../../api";
import JobCard from "../Jobs/jobcards";

function CompanyDetail({ hasAppliedToJob, applyToJob }) {   // <- accept props
  const { handle } = useParams();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async function load() {
      try {
        const c = await JoblyApi.getCompany(handle);
        setCompany(c);
      } catch (e) {
        setError(e);
      }
    })();
  }, [handle]);

  if (error) return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  if (!company) return <div>Loading…</div>;

  return (
    <div>
      <h1>{company.name}</h1>
      <p>{company.description}</p>

      {company.jobs.map(j => (
        <JobCard
          key={j.id}
          id={j.id}
          title={j.title}
          salary={j.salary}
          equity={j.equity}
          companyName={company.name}
          hasAppliedToJob={hasAppliedToJob}  // for apply button
          applyToJob={applyToJob}            // for apply button
        />
      ))}
    </div>
  );
}

export default CompanyDetail;
