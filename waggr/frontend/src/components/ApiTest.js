import React, { useEffect, useState } from "react";
import JoblyApi from "../api";

function ApiTest() {
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const result = await JoblyApi.getCompany("bauer-gallagher");
        console.log("API Response:", result);
        setCompany(result);
      } catch (err) {
        console.error("API Error:", err);
        setError(err);
      }
    }
    fetchCompany();
  }, []);

  if (error) return <p style={{color: "red"}}>Error: {error.toString()}</p>;
  if (!company) return <p>Loading company data...</p>;

  return (
    <div>
      <h1>{company.name}</h1>
      <p>{company.description}</p>
    </div>
  );
}

export default ApiTest;
