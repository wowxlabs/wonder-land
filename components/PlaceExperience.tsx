"use client";
import { useState, useEffect, useRef } from "react";
import { Place } from "@/data/places";
import { PLACE_STORIES, PlaceChapter } from "@/data/placeStories";

interface Props {
  place: Place;
  onBack: () => void;
}

export default function PlaceExperience({ place, onBack }: Props) {
  const chapters: PlaceChapter[] = PLACE_STORIES[place.id] ?? [
    {
      id: "overview",
      label: "Overview",
      title: place.name,
      subtitle: place.tagline,
      body: place.description,
      media: {
        type: "image",
        src: `https://placehold.co/800x500/1a2e10/d4c9a8?text=${encodeURIComponent(place.name)}`,
        caption: place.name,
      },
      accent: place.color,
      bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    },
  ];

  const [chapter, setChapter] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChapter(0);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [place.id]);

  function goTo(idx: number) {
    if (animating || idx === chapter) return;
    setAnimating(true);
    setTimeout(() => {
      setChapter(idx);
      setAnimating(false);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  }

  const c = chapters[chapter];

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

      {/* Film grain overlay */}
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
        <button
          onClick={onBack}
          style={{
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
          <span style={{ fontSize: 22 }}>{place.icon}</span>
          <span style={{ fontSize: 15, letterSpacing: "0.12em", color: "#d4c9a8", textTransform: "uppercase" }}>
            {place.name}
          </span>
        </div>

        {/* Chapter dots */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {chapters.map((ch, i) => (
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
      <div
        ref={contentRef}
        style={{
          flex: 1, overflowY: "auto", position: "relative", zIndex: 5,
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
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

            {/* Quick facts on overview chapter */}
            {c.facts && (
              <div style={{
                marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}>
                {c.facts.map(f => (
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
                    (e.target as HTMLImageElement).src =
                      `https://placehold.co/800x500/1a2e10/d4c9a8?text=${encodeURIComponent(c.title)}`;
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
                <div style={{ fontSize: 11, color: c.accent, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "system-ui" }}>
                  Chapter {chapter + 1} of {chapters.length}
                </div>
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
          {chapters[chapter].label}
        </div>

        <button
          onClick={() => goTo(chapter + 1)}
          disabled={chapter === chapters.length - 1}
          style={{
            background: chapter === chapters.length - 1 ? "none" : `${c.accent}22`,
            border: `1px solid ${chapter === chapters.length - 1 ? "#333" : c.accent + "66"}`,
            color: chapter === chapters.length - 1 ? "#444" : c.accent,
            padding: "8px 20px", borderRadius: 6,
            cursor: chapter === chapters.length - 1 ? "default" : "pointer",
            fontSize: 13, fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          Next →
        </button>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${c.accent}44; border-radius: 3px; }
      `}</style>
    </div>
  );
}
