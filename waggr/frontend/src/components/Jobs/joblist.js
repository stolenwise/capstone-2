// src/components/Jobs/JobList.js
import React, { useEffect, useState } from "react";
import JoblyApi from "../../api";
import JobCard from "./jobcards";
import JobDetails from "./jobdetails";
import "./jobcards.css";

function JobList({ hasAppliedToJob, applyToJob }) {
  const [jobs, setJobs] = useState([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async function load() {
      try {
        const j = await JoblyApi.getJobs();
        setJobs(j);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const j = await JoblyApi.getJobs(term.trim() || undefined); // backend filtering
      setJobs(j);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading jobs...</div>;
  if (error)   return <div style={{color:"red"}}>Error: {String(error)}</div>;
  if (!jobs.length) return (
    <div>
      <h1>Jobs</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search jobs..." />
        <button>Search</button>
      </form>
      <p>No jobs found.</p>
    </div>
  );

  return (
    <div>
      <h1>Jobs</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search jobs..." />
        <button>Search</button>
      </form>

      <div className="job-list">
        {jobs.map(j => (
          <JobCard
            key={j.id}
            id={j.id}
            title={j.title}
            salary={j.salary}
            equity={j.equity}
            companyName={j.companyName}
            hasAppliedToJob={hasAppliedToJob}
            applyToJob={applyToJob}
          />
        ))}
      </div>
    </div>
  );
}

export default JobList;
