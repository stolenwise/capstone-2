import { useEffect, useState } from "react";
import DoglyApi from "../api";

export default function PetfinderTest() {
  const [dogs, setDogs] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { dogs } = await DoglyApi.getPetfinderDogs({
          location: "95112", // change to your zip/city
          distance: 50,
          limit: 8
        });
        setDogs(dogs);
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading Petfinder dogs…</div>;
  if (err) return <div style={{color:"red"}}>Error: {String(err)}</div>;

  return (
    <div style={{padding: 16}}>
      <h2>Petfinder Test</h2>
      <ul>
        {dogs.map(d => (
          <li key={d.id}>
            {d.name} — {d.breed} ({d.city}{d.city && d.state ? ", " : ""}{d.state}){" "}
            <a href={d.url} target="_blank" rel="noreferrer">View</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
