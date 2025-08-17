import React, { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import DoglyApi from "../api";

// tune as needed
const CARD_W = 320;
const CARD_H = 440;
const PAGE_SIZE = 12;
const SWIPE_THRESHOLD = 120; // px

export default function SwipeDeck() {
  const [cards, setCards] = useState([]); // {id,url,name,breed,age,city,state,profileUrl}
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [likes, setLikes] = useState([]);
  const [passes, setPasses] = useState([]);

  // thread UI filters into this object later
  const query = useMemo(
    () => ({ location: "95112", distance: 50, limit: PAGE_SIZE, page }),
    [page]
  );

  // fetch a page and append to the deck
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { dogs } = await DoglyApi.getPetfinderDogs(query);
        if (cancelled) return;
        const mapped = dogs
          .filter(d => d.photoUrl) // basic quality filter
          .map(d => ({
            id: d.id,
            url: d.photoUrl,
            name: d.name,
            breed: d.breed,
            age: d.age,
            city: d.city,
            state: d.state,
            profileUrl: d.url,
          }));
        setCards(prev => [...prev, ...mapped]);
        setErr(null);
      } catch (e) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query]);

  // auto-load next page when deck runs low
  useEffect(() => {
    if (!loading && cards.length <= 2) setPage(p => p + 1);
  }, [cards.length, loading]);

  const handleDecision = (id, decision) => {
    setCards(prev => prev.filter(c => c.id !== id));
    if (decision === "like") setLikes(prev => [...prev, id]);
    else setPasses(prev => [...prev, id]);
    // TODO: persist to backend if you want
  };

  return (
    <div style={{ minHeight: 560, padding: 24, display: "grid", placeItems: "center" }}>
      {/* card stack container */}
      <div style={{ position: "relative", width: CARD_W, height: CARD_H }}>
        {cards.map((card, i) => (
          <DogCard
            key={card.id}
            card={card}
            isFront={i === cards.length - 1}
            onSwipe={(dir) => handleDecision(card.id, dir === "right" ? "like" : "pass")}
            indexFromTop={cards.length - 1 - i}
          />
        ))}

        {loading && cards.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            Loading dogs…
          </div>
        )}
      </div>

      {/* controls for keyboard/mouse users */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={() => cards.length && handleDecision(cards.at(-1).id, "pass")}
          style={btnStyle}
        >
          Nope
        </button>
        <button
          onClick={() => cards.length && handleDecision(cards.at(-1).id, "like")}
          style={btnStyle}
        >
          Like
        </button>
        {cards.length > 0 && (
          <a
            href={cards.at(-1).profileUrl}
            target="_blank"
            rel="noreferrer"
            style={{ ...btnStyle, textDecoration: "none" }}
          >
            View
          </a>
        )}
      </div>

      {/* tiny debug */}
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
        Likes: {likes.length} • Passes: {passes.length} • Page: {page}
      </div>

      {err && <div style={{ color: "red", marginTop: 8 }}>{String(err)}</div>}
    </div>
  );
}

function DogCard({ card, isFront, indexFromTop, onSwipe }) {
  const x = useMotionValue(0);
  const rotateDrag = useTransform(x, [-150, 150], [-16, 16]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  // fan-out rotation for non-front cards
  const baseTilt = indexFromTop === 0 ? 0 : (indexFromTop % 2 ? 6 : -6);
  const rotate = useTransform(() => `${rotateDrag.get() + baseTilt}deg`);

  const handleDragEnd = () => {
    const dx = x.get();
    if (Math.abs(dx) > SWIPE_THRESHOLD) onSwipe(dx > 0 ? "right" : "left");
  };

  // slight offset for stacked look
  const yOffset = Math.min(indexFromTop * 6, 18);
  const scale = isFront ? 1 : 0.98;

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        width: CARD_W,
        height: CARD_H,
        margin: "0 auto",
        x,
        opacity,
        rotate,
        borderRadius: 16,
        boxShadow: isFront
          ? "0 20px 25px rgba(0,0,0,.25), 0 8px 10px rgba(0,0,0,.15)"
          : "0 10px 15px rgba(0,0,0,.12)",
        background: "#fff",
        overflow: "hidden",
        userSelect: "none",
      }}
      animate={{ scale, y: yOffset }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <img
        src={card.url}
        alt={card.name}
        style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      {/* gradient + details */}
      <div style={{ position: "relative", height: CARD_H - 280 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.2) 100%)",
          }}
        />
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, color: "#111" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{card.name}</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {card.breed} • {card.age}
            {(card.city || card.state) && " • "}
            {[card.city, card.state].filter(Boolean).join(", ")}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const btnStyle = {
  border: "1px solid #ddd",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#fff",
  cursor: "pointer",
};
