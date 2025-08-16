import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import JoblyApi from "../../api";
import CompanyCard from "./companycard"; 
import "./companylist.css";

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("CompanyList mounted");
    async function fetchCompanies() {
      try {
        const result = await JoblyApi.getCompanies();
        console.log("Fetched companies:", result);
        setCompanies(result);         
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    const comps = await JoblyApi.getCompanies(term.trim() || undefined);
    setCompanies(comps);
    setLoading(false);
}

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
     <div className="company-list">
      <h1>Companies</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input 
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search companies..."
        />
        <button>Search</button>
      </form>
      
        {companies.map(c => (
          <CompanyCard
            key={c.handle}
            handle={c.handle}
            name={c.name}
            description={c.description}
            logoUrl={c.logoUrl}
          />
        ))}
      </div>
    </div>
  );
}

export default CompanyList;
