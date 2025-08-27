import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import DoglyApi from "../api";

const CARD_W = 320;
const CARD_H = 520;          // give the whole card more vertical room
const IMG_H  = 320;          // photo height for compact card
const PAGE_SIZE = 12;
const SWIPE_THRESHOLD = 120;
const SHADOWS = [
  "0 24px 32px rgba(0,0,0,.28), 0 10px 12px rgba(0,0,0,.18)", // front
  "0 12px 18px rgba(0,0,0,.16)",
  "0 6px 10px rgba(0,0,0,.10)",
  "0 2px 4px rgba(0,0,0,.06)",
  "none"
];

function saveLikedDog(dog) {
  const key = "waggr_likes";
  const pick = d => ({
    id: d.id,
    name: d.name,
    breed: d.breed || d.breeds?.primary || "Unknown",
    city: d.city || d.contact?.address?.city || "",
    state: d.state || d.contact?.address?.state || "",
    shelter: d.organization_name || d.organization_id || d._organization?.name || "Shelter",
    photo: (d.photos && d.photos[0]?.medium) || d.url || d.photoUrl || ""
  });
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  const exists = current.some(x => x.id === dog.id);
  const next = exists ? current : [pick(dog), ...current];
  localStorage.setItem(key, JSON.stringify(next));
}

export default function SwipeDeck() {
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [likes, setLikes] = useState([]);
  const [passes, setPasses] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // NEW

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
        if (cancelled) return;
        const mapped = dogs
          .filter(d => (d.photos?.length || d.photoUrl))
          .map(d => ({
            id: d.id,
            url: d.photoUrl,                 // primary (still used elsewhere)
            photos: (d.photos && d.photos.length ? d.photos : [d.photoUrl]).filter(Boolean),
            name: d.name,
            breed: d.breed,
            age: d.age,
            size: d.size,
            gender: d.gender,
            coat: d.coat,
            color: d.color,
            city: d.city,
            state: d.state,
            profileUrl: d.url,
            tags: d.tags,
            attributes: d.attributes,
            environment: d.environment,
            description: d.description,
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

  useEffect(() => {
    if (!loading && cards.length <= 2) setPage(p => p + 1);
  }, [cards.length, loading]);

  const handleDecision = (card, decision) => {
    setExpandedId(null);
    setCards(prev => prev.filter(c => c.id !== card.id));
   if (decision === "like") {
     setLikes(prev => [...prev, card.id]);
     saveLikedDog(card);
   } else {
     setPasses(prev => [...prev, card.id]);
   }
  };

  return (
    <div style={{ minHeight: 560, padding: 24, display: "grid", placeItems: "center" }}>
      {/* stack */}
      <div style={{ position: "relative", width: CARD_W, height: CARD_H }}>
        {cards.map((card, i) => (
          <DogCard
            key={card.id}
            card={card}
            isFront={i === cards.length - 1}
            indexFromTop={cards.length - 1 - i}
            // disable swipe when expanded
            isExpanded={expandedId === card.id}
            onToggleExpand={() =>
              setExpandedId(prev => (prev === card.id ? null : card.id))
            }
            onSwipe={dir => handleDecision(card, dir === "right" ? "like" : "pass")}
          />
        ))}
        {loading && cards.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            Loading dogs…
          </div>
        )}
      </div>

      {/* controls */}
      <div style={{ marginTop: 40, display: "flex", gap: 8 }}>
        <button
          onClick={() => cards.length && handleDecision(cards.at(-1), "pass")}
          style={btn}
        >Nope ❎</button>
        <button
          onClick={() => cards.length && handleDecision(cards.at(-1), "like")}
          style={btn}
        >Like ❤️</button>
        {cards.length > 0 && (
          <a href={cards.at(-1).profileUrl} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none" }}>
            View
          </a>
        )}
      </div>

      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7, color: "#fff"}}>
        Likes: {likes.length} • Passes: {passes.length} • Page: {page}
      </div>

      {err && <div style={{ color: "red", marginTop: 8 }}>{String(err)}</div>}
    </div>
  );
}

function DogCard({ card, isFront, indexFromTop, onSwipe, isExpanded, onToggleExpand }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const x = useMotionValue(0);
  const rotateDrag = useTransform(x, [-150, 150], [-16, 16]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const baseTilt = indexFromTop === 0 ? 0 : (indexFromTop % 2 ? 6 : -6);
  const rotate = useTransform(() => `${rotateDrag.get() + baseTilt}deg`);

  const yOffset = Math.min(indexFromTop * 6, 18);
  const scale = isFront ? 1 : 0.98;

  const photos = (card.photos && card.photos.length ? card.photos : [card.url]).filter(Boolean);

  const depth = Math.min(indexFromTop, SHADOWS.length - 1);
  const shadow = SHADOWS[depth];

    const nextPhoto = (e) => {
      e.stopPropagation();
      setPhotoIndex((photoIndex + 1) % photos.length);
    };
  
    const prevPhoto = (e) => {
      e.stopPropagation();
      setPhotoIndex((photoIndex - 1 + photos.length) % photos.length);
    };

  const handleDragEnd = () => {
    if (isExpanded) return; // no swipe while expanded
    const dx = x.get();
    if (Math.abs(dx) > SWIPE_THRESHOLD) onSwipe(dx > 0 ? "right" : "left");
  };

  // Compact pills builder (filter empty)
  const pills = [card.age, card.gender, card.size, card.color, card.coat].filter(Boolean);

  // Derived text
  const health = [
    card.attributes?.shots_current ? "Vaccinations up to date" : null,
    card.attributes?.spayed_neutered ? "Spayed/Neutered" : null,
    card.attributes?.special_needs ? "Special needs" : null,
  ].filter(Boolean).join(", ");
  const goodWith = [
    card.environment?.dogs ? "dogs" : null,
    card.environment?.cats ? "cats" : null,
    card.environment?.children ? "children" : null,
  ].filter(Boolean).join(", ");

  return (
    <>
      {/* Card in stack */}
      <motion.div
        layout // enables smooth size/pos animations
        style={{
          position: "absolute",
          inset: 0,
          width: CARD_W,
          height: CARD_H,
          margin: "0 auto",
          x, opacity, rotate,
          borderRadius: 18,
          background: "#fff",
          overflow: "hidden",
          boxShadow: shadow,
          cursor: "pointer",
          userSelect: "none",
        }}
        animate={{ scale, y: yOffset }}
        drag={isFront && !isExpanded ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={onToggleExpand}
      >
       <div style={{ position: "relative" }}>
  <img
    src={photos[photoIndex]}
    alt={card.name}
    style={{
      width: "100%",
      height: IMG_H,
      objectFit: "cover",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12
    }}
  />
  
  {photos.length > 1 && (
    <>
      {/* Left arrow */}
      <button
        onClick={prevPhoto}
        style={{
          position: "absolute",
          top: "50%",
          left: 10,
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.4)",
          border: "none",
          borderRadius: "50%",
          color: "white",
          width: 32,
          height: 32,
          cursor: "pointer"
        }}
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={nextPhoto}
        style={{
          position: "absolute",
          top: "50%",
          right: 10,
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.4)",
          border: "none",
          borderRadius: "50%",
          color: "white",
          width: 32,
          height: 32,
          cursor: "pointer"
        }}
      >
        ›
      </button>
    </>
  )}
</div>

        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>{card.name}</div>
          <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
            {card.breed} • {[card.city, card.state].filter(Boolean).join(", ")}
          </div>

          <div style={{ borderTop: "1px solid #eee", margin: "8px 0" }} />

          {/* pills row (only if present) */}
          {pills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {pills.map(p => <Chip key={p}>{p}</Chip>)}
            </div>
          )}

          {/* condensed About (always non-empty lines only) */}
          {("house_trained" in (card.attributes || {})) && (
            <Line><b>House-trained</b>: {card.attributes.house_trained ? "Yes" : "No"}</Line>
          )}
          {health && <Line><b>Health</b>: {health}</Line>}
        </div>
      </motion.div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
              display: "grid", placeItems: "center", zIndex: 50
            }}
            onClick={onToggleExpand}
          >
            <motion.div
              layout
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 360, maxWidth: "92vw", maxHeight: "88vh",
                background: "#fff", borderRadius: 18, overflow: "auto",
                boxShadow: "0 24px 30px rgba(0,0,0,.35)",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={photos[photoIndex]}
                  alt={card.name}
                  style={{ width: "100%", height: IMG_H + 40, objectFit: "cover", display: "block" }}
                />
                {photos.length > 1 && (
                  <>
                    <button onClick={prevPhoto} style={arrowLeft}>‹</button>
                    <button onClick={nextPhoto} style={arrowRight}>›</button>
                  </>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#111" }}>{card.name}</div>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                  {card.breed} • {[card.city, card.state].filter(Boolean).join(", ")}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {pills.map(p => <Chip key={p}>{p}</Chip>)}
                </div>

                <Hr />

                {card.tags?.length ? (
                  <Section title="Characteristics">
                    {card.tags.join(", ")}
                  </Section>
                ) : null}

                {card.coat ? (
                  <Section title="Coat length">{card.coat}</Section>
                ) : null}

                {"house_trained" in (card.attributes || {}) ? (
                  <Section title="House-trained">{card.attributes.house_trained ? "Yes" : "No"}</Section>
                ) : null}

                {health && <Section title="Health">{health}</Section>}

                {goodWith && <Section title="Good in a home with">{goodWith}</Section>}

                {card.description && (
                  <>
                    <Hr />
                    <Section title="About">
                      <div className="about-section">{card.description}</div>
                      </Section>
                  </>
                )}

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <a href={card.profileUrl} target="_blank" rel="noreferrer" style={btn}>
                    View on Petfinder
                  </a>
                  <button onClick={onToggleExpand} style={btn}>Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      padding: "4px 10px",
      border: "1px solid #e5e7eb",
      borderRadius: 999,
      fontSize: 12,
      background: "#f3f4f6",
      color: "#333",
    }}>
      {children}
    </span>
  );
}

const Line = ({ children }) => (
  <div style={{ fontSize: 12, lineHeight: 1.5, color: "#333" }}>{children}</div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: .3, color: "#444" }}>{title}</div>
    <div style={{ fontSize: 13, color: "#222" }}>{children}</div>
  </div>
);

const Hr = () => <div style={{ height: 1, background: "#eee", margin: "10px 0" }} />;

const btn = {
  border: "1px solid #ddd",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#fff",
  cursor: "pointer",
};

const arrowBase = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.45)",
  border: "none",
  borderRadius: "50%",
  color: "white",
  width: 32,
  height: 32,
  cursor: "pointer"
};

const arrowLeft = { ...arrowBase, left: 12 };
const arrowRight = { ...arrowBase, right: 12 };