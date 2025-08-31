// src/components/Matches.jsx
import React, { useEffect, useState } from "react";

const KEY = "waggr_likes";

function loadLikes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export default function Matches() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    setDogs(loadLikes());
  }, []);

  const clearMatches = () => {
    localStorage.removeItem(KEY);
    setDogs([]);
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Matches</h2>

      {dogs.length === 0 ? (
        <EmptyState />
      ) : (
        <ul style={styles.list}>
          {dogs.map((d) => {
            const calendlyUrl =
              `https://calendly.com/waggr-dogwalking/30min`;
            return (
              <li key={d.id} style={styles.card}>
                {/* Photo */}
                {d.photo ? (
                  <img
                    src={d.photo}
                    alt={d.name || "Dog"}
                    style={styles.photo}
                  />
                ) : (
                  <div style={styles.photoPlaceholder} />
                )}

               {/* Info */}
                <div style={styles.info}>
                <h3 style={styles.name}>{d.name || "Unknown"}</h3>   {/* 👈 dog name here */}
                <p style={styles.dim}>{d.breed || "—"}</p>
                <p style={styles.dim}>
                    {[d.city, d.state].filter(Boolean).join(", ")}
                </p>
                <p style={styles.shelter}>
                    <strong>Shelter:</strong> {d.shelter || "—"}
                </p>
                </div>

                {/* Per-dog Book button */}
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.bookBtn}
                  title={`Book a Walk with ${d.name || "this dog"}`}
                >
                  {`Book a Walk`}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {dogs.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={clearMatches} style={styles.clearBtn}>
            Clear Matches
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={styles.empty}>
      <p style={{ margin: 0 }}>No matches yet — go like some pups!</p>
      <a href="/dogs" style={styles.linkBtn}>Let's get waggin'!</a>
    </div>
  );
}

/* ---------- styles ---------- */

const styles = {
  page: {
    maxWidth: 1100,
    margin: "24px auto",
    padding: "0 16px",
  },
  title: {
    color: "#fff",
    margin: "0 0 16px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 16,
  },
  card: {
    display: "grid",
    gridTemplateColumns: "120px 1fr auto",
    alignItems: "center",
    gap: 16,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
    padding: 12,
  },
  photo: {
    width: 120,
    height: 120,
    objectFit: "cover",
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    background: "#eee",
    borderRadius: 12,
  },
  info: {
    minWidth: 0,
  },
  name: {
    margin: "0 0 4px",
    lineHeight: 1.1,
    color: "#000"
  },

  dim: {
    margin: "2px 0",
    color: "#555",
  },
  shelter: {
    margin: "6px 0 0",
    color: "#444",
  },
  bookBtn: {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 999,
    textDecoration: "none",
    background: "#5b7cff",
    color: "#fff",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  clearBtn: {
    border: "1px solid #ddd",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#fff",
    cursor: "pointer",
  },
  empty: {
    background: "rgba(255,255,255,.85)",
    borderRadius: 16,
    padding: 16,
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  },
  linkBtn: {
    display: "inline-block",
    marginTop: 8,
    padding: "8px 12px",
    borderRadius: 999,
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #ddd",
    color: "#111",
    fontWeight: 600,
  },
};
