import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DoglyApi from "../../api";

function DogDetails() {
  const { id } = useParams();                 // <-- use :id
  const [dog, setDog] = useState(null);       // <-- lower-case dog
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const j = await DoglyApi.getDog(id);
        setDog(j);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p>Loading dog…</p>;
  if (error) return <p style={{color:'red'}}>Error loading dog.</p>;
  if (!dog) return <p>Dog not found.</p>;

  return (
    <div className="DogDetail">
      <h2>{dog.title}</h2>
      {dog.shelterName && <p>Shelter: {dog.shelterName}</p>}
      <p>Salary: {dog.salary ?? "—"}</p>
      <p>Equity: {dog.equity ?? "—"}</p>
      {/* Add an Apply button later when auth is done */}
    </div>
  );
}

export default DogDetails;

