// src/components/Shelter/shelterdetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DoglyApi from "../../api";
import DogCard from "../Dogs/dogcards";

function ShelterDetail({ hasAppliedToDog, applyToDog }) {   // <- accept props
  const { handle } = useParams();
  const [shelter, setShelter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async function load() {
      try {
        const c = await DoglyApi.getShelter(handle);
        setShelter(c);
      } catch (e) {
        setError(e);
      }
    })();
  }, [handle]);

  if (error) return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  if (!shelter) return <div>Loading…</div>;

  return (
    <div>
      <h1>{shelter.name}</h1>
      <p>{shelter.description}</p>

      {shelter.dogs.map(j => (
        <DogCard
          key={j.id}
          id={j.id}
          title={j.title}
          salary={j.salary}
          equity={j.equity}
          shelterName={shelter.name}
          hasAppliedToDog={hasAppliedToDog}  // for apply button
          applyToDog={applyToDog}            // for apply button
        />
      ))}
    </div>
  );
}

export default ShelterDetail;
