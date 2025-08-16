import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JoblyApi from "../../api";

function JobDetails() {
  const { id } = useParams();                 // <-- use :id
  const [job, setJob] = useState(null);       // <-- lower-case job
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const j = await JoblyApi.getJob(id);
        setJob(j);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p>Loading job…</p>;
  if (error) return <p style={{color:'red'}}>Error loading job.</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div className="JobDetail">
      <h2>{job.title}</h2>
      {job.companyName && <p>Company: {job.companyName}</p>}
      <p>Salary: {job.salary ?? "—"}</p>
      <p>Equity: {job.equity ?? "—"}</p>
      {/* Add an Apply button later when auth is done */}
    </div>
  );
}

export default JobDetails;

