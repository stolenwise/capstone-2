import React, { useEffect, useState } from "react";
import DoglyApi from "../api";

function ApiTest() {
  const [shelter, setShelter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShelter() {
      try {
        const result = await DoglyApi.getShelter("bauer-gallagher");
        console.log("API Response:", result);
        setShelter(result);
      } catch (err) {
        console.error("API Error:", err);
        setError(err);
      }
    }
    fetchShelter();
  }, []);

  if (error) return <p style={{color: "red"}}>Error: {error.toString()}</p>;
  if (!shelter) return <p>Loading shelter data...</p>;

  return (
    <div>
      <h1>{shelter.name}</h1>
      <p>{shelter.description}</p>
    </div>
  );
}

export default ApiTest;
