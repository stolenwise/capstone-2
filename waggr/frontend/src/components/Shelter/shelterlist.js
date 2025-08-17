import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import DoglyApi from "../../api";
import ShelterCard from "./sheltercard"; 
import "./shelterlist.css";

function ShelterList() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("ShelterList mounted");
    async function fetchShelters() {
      try {
        const result = await DoglyApi.getShelters();
        console.log("Fetched shelters:", result);
        setShelters(result);         
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchShelters();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    const comps = await DoglyApi.getShelters(term.trim() || undefined);
    setShelters(comps);
    setLoading(false);
}

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
     <div className="shelter-list">
      <h1>Shelters</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input 
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search shelters..."
        />
        <button>Search</button>
      </form>
      
        {shelters.map(c => (
          <ShelterCard
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

export default ShelterList;
