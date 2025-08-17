// src/components/Dogs/DogList.js
import React, { useEffect, useState } from "react";
import DoglyApi from "../../api";
import DogCard from "./dogcards";
import DogDetails from "./dogdetails";
import "./dogcards.css";

function DogList({ hasAppliedToDog, applyToDog }) {
  const [dogs, setDogs] = useState([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async function load() {
      try {
        const j = await DoglyApi.getDogs();
        setDogs(j);
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
      const j = await DoglyApi.getDogs(term.trim() || undefined); // backend filtering
      setDogs(j);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading dogs...</div>;
  if (error)   return <div style={{color:"red"}}>Error: {String(error)}</div>;
  if (!dogs.length) return (
    <div>
      <h1>Dogs</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search dogs..." />
        <button>Search</button>
      </form>
      <p>No dogs found.</p>
    </div>
  );

  return (
    <div>
      <h1>Dogs</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search dogs..." />
        <button>Search</button>
      </form>

      <div className="dog-list">
        {dogs.map(j => (
          <DogCard
            key={j.id}
            id={j.id}
            title={j.title}
            salary={j.salary}
            equity={j.equity}
            shelterName={j.shelterName}
            hasAppliedToDog={hasAppliedToDog}
            applyToDog={applyToDog}
          />
        ))}
      </div>
    </div>
  );
}

export default DogList;
