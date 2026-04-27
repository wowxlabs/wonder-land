"use client";
import { useState, useEffect, useRef } from "react";

const CHAPTERS = [
  {
    id: "overview",
    label: "Overview",
    title: "Yala National Park",
    subtitle: "Sri Lanka's Crown Jewel of Wildlife",
    body: `Stretching across 979 square kilometres of scrub jungle, lagoons, and coastal dunes in southeastern Sri Lanka, Yala is the island's most visited and celebrated national park. Established in 1938, it spans five blocks — only Block I is open to the public, yet it contains more wildlife per square kilometre than almost anywhere on earth.\n\nYala sits at a crossroads of ecosystems: ancient rock formations shelter leopards, monsoon-fed lagoons host crocodiles and flamingos, and open plains carry elephant herds into view at dawn. The park's southern boundary meets the Indian Ocean, making it the only major wildlife reserve in the world where you can watch leopards prowl above the sea.`,
    media: {
      type: "image" as const,
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Yala_National_Park_Block_I.jpg/1280px-Yala_National_Park_Block_I.jpg",
      caption: "The golden scrub plains of Yala Block I at dawn — © Wikimedia Commons",
    },
    accent: "#d97706",
    bg: "linear-gradient(135deg, #0a1a0a 0%, #1a2e10 40%, #0d1f0d 100%)",
  },
  {
    id: "leopard",
    label: "Leopard",
    title: "The Sri Lanka Leopard",
    subtitle: "World's Highest Wild Density",
    body: `Yala holds the highest recorded density of wild leopards on earth — approximately one leopard per 15 square kilometres in Block I. Unlike leopards elsewhere in Asia who retreat in the presence of tigers, Sri Lanka has no tigers. Here the leopard is the apex predator, and it moves in full daylight with extraordinary confidence.\n\nThe population is genetically distinct — classified as Panthera pardus kotiya, the Sri Lanka leopard is a unique subspecies found nowhere else on the planet. Rangers estimate around 30–35 individuals in Block I alone, each with a mapped home territory. The dominant males mark granite outcrops with scent and patrol their ranges at dusk and dawn.\n\nThe best sightings are between 5:30–8:00am, near the Jamburagala rock complex and the waterholes of Palatupana. Leopards frequently rest in branches above jeep tracks, utterly indifferent to cameras below.`,
    media: {
      type: "image" as const,
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Leopard_at_Yala_National_Park.jpg/1280px-Leopard_at_Yala_National_Park.jpg",
      caption: "Panthera pardus kotiya — the Sri Lanka leopard, Yala Block I — © Wikimedia Commons",
    },
    accent: "#f59e0b",
    bg: "linear-gradient(135deg, #1a0e00 0%, #2d1a00 40%, #1a0e00 100%)",
  },
  {
    id: "elephants",
    label: "Elephants",
    title: "Wild Elephant Herds",
    subtitle: "Giants of the Scrub Jungle",
    body: `Sri Lankan elephants — Elephas maximus maximus — are the largest of all Asian elephant subspecies, and Yala is one of the finest places on earth to observe them in the wild. Herds of 20 or more are regularly encountered near the Menik Ganga river and the Buttuwa tanks, especially during the dry season from May to September when water sources concentrate the herds.\n\nYala's elephants have learned to co-exist with safari jeeps over generations. Young bulls perform mock charges to test boundaries; matriarchs lead calves calmly past vehicles to reach waterholes. The afternoon light turns the scrub gold around them.\n\nDuring the dry season, dramatic scenes unfold as elephants excavate dry riverbeds for water, digging with their feet and trunks — a behaviour observed nowhere else in Sri Lanka. The park holds an estimated 300–350 individuals across all five blocks.`,
    media: {
      type: "video" as const,
      src: "https://www.youtube.com/embed/Mq6NHPbqLks?autoplay=0&rel=0&modestbranding=1",
      caption: "Wild elephant herd at a Yala waterhole — filmed in Block I",
    },
    accent: "#78716c",
    bg: "linear-gradient(135deg, #0a1200 0%, #1a2800 40%, #0a1200 100%)",
  },
  {
    id: "wildlife",
    label: "Wildlife",
    title: "Beyond the Big Five",
    subtitle: "215 Bird Species & More",
    body: `Yala's biodiversity extends far beyond its famous leopards and elephants. The park is home to the sloth bear (Melursus ursinus inornatus), the Sri Lankan subspecies found only on this island — shy and nocturnal, but spotted in the rocky outcrops near Sithulpawwa at dawn.\n\nMugger crocodiles patrol every lagoon and tank, basking motionless on banks until disturbed. Water monitors — the largest lizards in Sri Lanka — lunge from embankments. The saltwater flats host flamingo flocks that appear overnight and vanish by midday.\n\nFor birdwatchers, Kumana National Park (formerly Yala East) hosts the most spectacular bird colonies: painted storks, spoonbills, open-billed storks and lesser adjutants nest in the mangroves between April and July. At sunrise, the sky above the lagoon turns orange with ascending thousands.`,
    media: {
      type: "image" as const,
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sloth_Bear_Melursus_ursinus_by_Shantanu_Kuveskar.jpg/1280px-Sloth_Bear_Melursus_ursinus_by_Shantanu_Kuveskar.jpg",
      caption: "Sri Lankan sloth bear (Melursus ursinus inornatus) — © Shantanu Kuveskar / Wikimedia",
    },
    accent: "#059669",
    bg: "linear-gradient(135deg, #001a0f 0%, #00291a 40%, #001a0f 100%)",
  },
  {
    id: "safari",
    label: "Safari",
    title: "The Safari Experience",
    subtitle: "Into the Golden Hour",
    body: `Safari in Yala runs on two sessions: the dawn drive (5:30–10:00am) and the afternoon drive (2:30–6:00pm). The morning session is prime for leopard sightings as they descend from rocky eminences to drink; the afternoon light turns the scrub and water gold as elephant herds move to waterholes.\n\nLicensed guides are mandatory and shape the entire experience. The best — like Ravi Samaraweera, who has guided Block I for 22 years — know individual leopards by name, read fresh pug marks in the sand, and position vehicles to intercept animals rather than chase them.\n\n"The elephants know our jeeps," says Ravi. "They don't run anymore. The young bulls sometimes mock-charge to test us. I know them all by their ear shapes. The leopards are different — they appear when they want to. You earn their attention. You cannot demand it."\n\nThe park entrance is at Palatupana, 300km south of Colombo. The nearest town is Tissamaharama, 12km away, with accommodation ranging from tented camps at the park boundary to eco-lodges in the buffer zone.`,
    media: {
      type: "image" as const,
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Mugger_Crocodile_%28Crocodylus_palustris%29_in_Yala_National_Park.jpg/1280px-Mugger_Crocodile_%28Crocodylus_palustris%29_in_Yala_National_Park.jpg",
      caption: "Mugger crocodile at a Yala lagoon — © Wikimedia Commons",
    },
    accent: "#7c3aed",
    bg: "linear-gradient(135deg, #0a0014 0%, #150020 40%, #0a0014 100%)",
  },
];

interface Props {
  onBack: () => void;
}

export default function YalaExperience({ onBack }: Props) {
  const [chapter, setChapter] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  function goTo(idx: number) {
    if (animating || idx === chapter) return;
    setAnimating(true);
    setTimeout(() => {
      setChapter(idx);
      setAnimating(false);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  }

  const c = CHAPTERS[chapter];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: c.bg,
      transition: "background 0.8s ease",
      opacity: visible ? 1 : 0,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#f5f0e8",
      overflow: "hidden",
    }}>

      {/* Ambient noise overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        opacity: 0.4, zIndex: 0,
      }} />

      {/* Top bar */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 28px",
        borderBottom: `1px solid ${c.accent}33`,
        backdropFilter: "blur(8px)",
        background: "rgba(0,0,0,0.35)",
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: `1px solid ${c.accent}66`,
          color: c.accent, padding: "7px 16px", borderRadius: 6,
          cursor: "pointer", fontSize: 13, letterSpacing: "0.05em",
          fontFamily: "inherit", transition: "all 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = `${c.accent}22`)}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
        >
          ← Back to Map
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🐆</span>
          <span style={{ fontSize: 15, letterSpacing: "0.12em", color: "#d4c9a8", textTransform: "uppercase" }}>
            Yala National Park
          </span>
        </div>

        {/* Chapter dots */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {CHAPTERS.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => goTo(i)}
              title={ch.label}
              style={{
                width: i === chapter ? 28 : 9,
                height: 9,
                borderRadius: 5,
                background: i === chapter ? c.accent : `${c.accent}44`,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div ref={contentRef} style={{
        flex: 1, overflowY: "auto", position: "relative", zIndex: 5,
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(12px)" : "translateY(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "40px 28px 60px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "start",
        }}>

          {/* Left — text */}
          <div>
            <p style={{
              fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
              color: c.accent, margin: "0 0 10px", fontFamily: "system-ui, sans-serif",
            }}>
              {c.subtitle}
            </p>
            <h1 style={{
              fontSize: 42, margin: "0 0 24px", lineHeight: 1.1,
              fontWeight: 400, color: "#f5f0e8",
              textShadow: `0 0 60px ${c.accent}55`,
            }}>
              {c.title}
            </h1>

            <div style={{
              width: 48, height: 2, background: c.accent,
              marginBottom: 28, borderRadius: 2,
            }} />

            {c.body.split("\n\n").map((para, i) => (
              <p key={i} style={{
                fontSize: 16, lineHeight: 1.85, color: "#d4c9a8",
                margin: "0 0 20px", fontWeight: 400,
              }}>
                {para}
              </p>
            ))}

            {/* Quick facts */}
            {chapter === 0 && (
              <div style={{
                marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}>
                {[
                  { icon: "📏", label: "Area", value: "979 km²" },
                  { icon: "🐆", label: "Leopard Density", value: "Highest on Earth" },
                  { icon: "🐘", label: "Elephants", value: "300–350" },
                  { icon: "🦜", label: "Bird Species", value: "215+" },
                ].map(f => (
                  <div key={f.label} style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${c.accent}33`,
                    borderRadius: 8, padding: "12px 16px",
                  }}>
                    <div style={{ fontSize: 20 }}>{f.icon}</div>
                    <div style={{ fontSize: 11, color: c.accent, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "system-ui", marginTop: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 15, color: "#f5f0e8", marginTop: 2 }}>{f.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — media */}
          <div style={{ position: "sticky", top: 20 }}>
            <div style={{
              borderRadius: 12, overflow: "hidden",
              border: `1px solid ${c.accent}44`,
              boxShadow: `0 0 60px ${c.accent}22, 0 20px 60px rgba(0,0,0,0.6)`,
            }}>
              {c.media.type === "image" ? (
                <img
                  src={c.media.src}
                  alt={c.title}
                  style={{ width: "100%", display: "block", aspectRatio: "16/10", objectFit: "cover" }}
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/800x500/1a2e10/d4c9a8?text=${encodeURIComponent(c.title)}`;
                  }}
                />
              ) : (
                <iframe
                  src={c.media.src}
                  style={{ width: "100%", aspectRatio: "16/10", border: "none", display: "block" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              <div style={{
                padding: "10px 14px",
                background: "rgba(0,0,0,0.5)",
                fontSize: 12, color: "#8a8070",
                fontFamily: "system-ui, sans-serif",
                fontStyle: "italic",
              }}>
                {c.media.caption}
              </div>
            </div>

            {/* Chapter label card */}
            <div style={{
              marginTop: 16, padding: "16px 20px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${c.accent}22`,
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${c.accent}22`,
                border: `1px solid ${c.accent}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, color: c.accent,
                fontFamily: "system-ui",
              }}>
                {chapter + 1}
              </div>
              <div>
                <div style={{ fontSize: 11, color: c.accent, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "system-ui" }}>Chapter {chapter + 1} of {CHAPTERS.length}</div>
                <div style={{ fontSize: 14, color: "#d4c9a8", marginTop: 2 }}>{c.label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 28px",
        borderTop: `1px solid ${c.accent}22`,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        flexShrink: 0,
      }}>
        <button
          onClick={() => goTo(chapter - 1)}
          disabled={chapter === 0}
          style={{
            background: "none",
            border: `1px solid ${chapter === 0 ? "#333" : c.accent + "66"}`,
            color: chapter === 0 ? "#444" : c.accent,
            padding: "8px 20px", borderRadius: 6,
            cursor: chapter === 0 ? "default" : "pointer",
            fontSize: 13, fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          ← Previous
        </button>

        <div style={{
          fontSize: 12, color: "#6b6050",
          letterSpacing: "0.08em", fontFamily: "system-ui",
        }}>
          {CHAPTERS[chapter].label}
        </div>

        <button
          onClick={() => goTo(chapter + 1)}
          disabled={chapter === CHAPTERS.length - 1}
          style={{
            background: chapter === CHAPTERS.length - 1 ? "none" : `${c.accent}22`,
            border: `1px solid ${chapter === CHAPTERS.length - 1 ? "#333" : c.accent + "66"}`,
            color: chapter === CHAPTERS.length - 1 ? "#444" : c.accent,
            padding: "8px 20px", borderRadius: 6,
            cursor: chapter === CHAPTERS.length - 1 ? "default" : "pointer",
            fontSize: 13, fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          Next →
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${c.accent}44; border-radius: 3px; }
      `}</style>
    </div>
  );
}
