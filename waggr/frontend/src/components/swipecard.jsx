import React, { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import DoglyApi from "../api";

const PAGE_SIZE = 12;

export default function SwipeCards() {
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [likes, setLikes] = useState([]);
  const [passes, setPasses] = useState([]);

  // basic query; you can pipe UI filters into this object later
  const query = useMemo(
    () => ({ location: "95112", distance: 50, limit: PAGE_SIZE, page }),
    [page]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { dogs } = await DoglyApi.getPetfinderDogs(query);
        if (!cancelled) {
          // normalize to the shape Card expects
          const mapped = dogs
            .filter(d => d.photoUrl) // simple quality filter (optional)
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
        }
      } catch (e) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query]);

  // when the deck runs low, fetch next page
  useEffect(() => {
    if (!loading && cards.length <= 2) setPage(p => p + 1);
  }, [cards.length, loading]);

  const handleDecision = (id, decision) => {
    setCards(prev => prev.filter(c => c.id !== id));
    if (decision === "like") setLikes(prev => [...prev, id]);
    else setPasses(prev => [...prev, id]);
    // later: persist to backend, trigger booking flow, etc.
  };

  if (err) return <div style={{ color: "red" }}>Error: {String(err)}</div>;

  return (
    <div className="grid min-h-[520px] w-full place-items-center bg-neutral-100">
      {/* stack */}
      <div className="relative h-[420px] w-[320px]">
        {cards.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            isFront={i === cards.length - 1}
            onSwipe={dir => handleDecision(card.id, dir === "right" ? "like" : "pass")}
          />
        ))}
        {loading && cards.length === 0 && <div className="absolute inset-0 grid place-items-center">Loading…</div>}
      </div>

      {/* actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => cards.length && handleDecision(cards.at(-1).id, "pass")}
          className="rounded-full border px-4 py-2"
        >Nope</button>
        <button
          onClick={() => cards.length && handleDecision(cards.at(-1).id, "like")}
          className="rounded-full border px-4 py-2"
        >Like</button>
        {cards.length > 0 && (
          <a
            href={cards.at(-1).profileUrl}
            target="_blank" rel="noreferrer"
            className="rounded-full border px-4 py-2"
          >
            View
          </a>
        )}
      </div>

      {/* tiny debug */}
      <div className="mt-2 text-sm opacity-70">
        Likes: {likes.length} • Passes: {passes.length} • Page: {page}
      </div>
    </div>
  );
}

function Card({ card, isFront, onSwipe }) {
  const x = useMotionValue(0);
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const rotate = useTransform(() => `${rotateRaw.get()}deg`);

  const handleDragEnd = () => {
    const dx = x.get();
    if (Math.abs(dx) > 100) onSwipe(dx > 0 ? "right" : "left");
  };

  return (
    <motion.div
      className="absolute inset-0 mx-auto h-[420px] w-[320px] origin-bottom"
      style={{ x, opacity, rotate, gridRow: 1, gridColumn: 1 }}
      animate={{ scale: isFront ? 1 : 0.98, y: isFront ? 0 : 6 }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-white shadow-lg">
        <img
          src={card.url}
          alt={card.name}
          className="h-64 w-full object-cover"
          onError={e => (e.currentTarget.style.display = "none")}
        />
        <div className="p-3">
          <div className="text-lg font-semibold">{card.name}</div>
          <div className="text-sm opacity-80">
            {card.breed} • {card.age}{(card.city || card.state) && " • "}
            {[card.city, card.state].filter(Boolean).join(", ")}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

