import React, { useEffect, useState } from "react";
import DoglyApi from "../api";

function ApiTest() {
  const [shelter, setShelter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async function run() {
      try {
        const result = await DoglyApi.getShelter(1); 
        setShelter(result);
      } catch (err) {
        setError(err);
      }
    })();
  }, []);

  if (error) return <p style={{ color: "red" }}>Error: {String(error)}</p>;
  if (!shelter) return <p>Loading shelter data...</p>;

  return (
    <div>
      <h1>{shelter.name}</h1>
      <p>{shelter.city}, {shelter.state}</p>
      <a href={shelter.website} target="_blank" rel="noreferrer">{shelter.website}</a>
    </div>
  );
}

export default ApiTest;

