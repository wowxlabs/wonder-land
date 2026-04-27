"use client";
import { useEffect, useState } from "react";

interface Props {
  show: boolean;
  isReady?: boolean;
  onEnter?: () => void;
}

const FACTS = [
  { emoji: "🦁", text: "Sri Lanka's flag is the only national flag in the world depicting a sword-wielding lion." },
  { emoji: "🌳", text: "The sacred fig tree in Anuradhapura was planted in 288 BC — the oldest documented human-planted tree on Earth." },
  { emoji: "🐘", text: "Sri Lanka has the world's highest density of Asian elephants, with over 7,500 living in the wild." },
  { emoji: "🍵", text: "Sri Lanka is the world's 4th largest tea producer. Ceylon tea accounts for 23% of global tea exports." },
  { emoji: "🏔️", text: "Sigiriya rock fortress was built in the 5th century AD and is considered by some historians to be the 8th Wonder of the World." },
  { emoji: "🐋", text: "The world's largest animal, the blue whale, can be spotted just off the coast of Mirissa." },
  { emoji: "💎", text: "Sri Lanka is called the 'Gem Island' — it produces sapphires, rubies, and cats-eye stones found almost nowhere else." },
  { emoji: "🚂", text: "The Kandy–Ella train journey is rated one of the most scenic rail rides on the planet, passing through cloud forest tea estates." },
  { emoji: "🌿", text: "Ceylon cinnamon — the 'true' cinnamon — originates exclusively from Sri Lanka and is distinct from cassia sold elsewhere." },
  { emoji: "🏛️", text: "Sri Lanka has 8 UNESCO World Heritage Sites packed into a country smaller than Ireland." },
  { emoji: "🎣", text: "The stilt fishermen of Koggala and Weligama balance on wooden poles planted in the surf — a tradition unique to Sri Lanka." },
  { emoji: "🌊", text: "After the 2004 tsunami, Sri Lanka built one of the world's first community-based coastal early-warning systems." },
  { emoji: "🦚", text: "Yala National Park has the highest density of wild leopards of any national park on Earth." },
  { emoji: "📚", text: "Sri Lanka has a 92% literacy rate — the highest in South Asia." },
  { emoji: "🕌", text: "Sri Lanka is one of the few places where Buddhist temples, Hindu kovils, mosques, and churches stand side by side on the same street." },
];

export default function LoaderScreen({ show, isReady = false, onEnter }: Props) {
  const [mounted, setMounted]       = useState(true);
  const [progress, setProgress]     = useState(0);
  const [showEnter, setShowEnter]   = useState(false);
  const [btnHover, setBtnHover]     = useState(false);
  const [factIdx, setFactIdx]       = useState(0);
  const [factVisible, setFactVisible] = useState(true);

  // Mount / unmount with fade
  useEffect(() => {
    if (!show) {
      const t = setTimeout(() => {
        setMounted(false);
        setProgress(0);
        setShowEnter(false);
      }, 800);
      return () => clearTimeout(t);
    }
    setMounted(true);
  }, [show]);

  // Fake progress to 82%, hold until isReady
  useEffect(() => {
    if (!show) return;
    setProgress(0);
    setShowEnter(false);
    let current = 0;
    const iv = setInterval(() => {
      current += 1.8;
      if (current >= 82) { clearInterval(iv); current = 82; }
      setProgress(Math.round(current));
    }, 40);
    return () => clearInterval(iv);
  }, [show]);

  // Safety fallback
  useEffect(() => {
    if (!show || isReady) return;
    const t = setTimeout(() => {
      setProgress(100);
      setShowEnter(true);
    }, 4200);
    return () => clearTimeout(t);
  }, [show, isReady]);

  // When map ready, fill to 100% then show Enter
  useEffect(() => {
    if (!isReady) return;
    let p = 82;
    const iv = setInterval(() => {
      p += 3;
      if (p >= 100) {
        clearInterval(iv);
        setProgress(100);
        setTimeout(() => setShowEnter(true), 220);
      } else {
        setProgress(p);
      }
    }, 28);
    return () => clearInterval(iv);
  }, [isReady]);

  // Cycle facts with fade — only while loading
  useEffect(() => {
    if (!show || showEnter) return;
    const iv = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIdx(i => (i + 1) % FACTS.length);
        setFactVisible(true);
      }, 380);
    }, 4000);
    return () => clearInterval(iv);
  }, [show, showEnter]);

  if (!mounted) return null;

  const fact = FACTS[factIdx];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: show ? 1 : 0,
        transition: "opacity 0.8s cubic-bezier(0.55,0,0.1,1)",
        pointerEvents: show ? "auto" : "none",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url('${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/game.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }} />

      {/* Vignette overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(4,8,28,0.18) 0%, rgba(4,8,28,0.62) 100%)",
      }} />

      {/* Glass card */}
      <div style={{
        position: "relative", zIndex: 2,
        textAlign: "center",
        padding: "42px 52px 48px",
        borderRadius: 28,
        background: "rgba(6,10,30,0.22)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 24px 72px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
        minWidth: 300,
        maxWidth: 480,
      }}>

        {/* Pill label */}
        <div style={{
          display: "inline-block",
          background: "rgba(238,205,2,0.14)",
          border: "1px solid rgba(238,205,2,0.50)",
          color: "#eecd02",
          fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
          fontSize: "0.90rem",
          letterSpacing: "0.28em",
          padding: "5px 20px",
          borderRadius: 999,
          marginBottom: 22,
          backdropFilter: "blur(8px)",
        }}>
          Discover Sri Lanka
        </div>

        {/* Main title */}
        <h1 style={{
          margin: "0 0 4px",
          fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
          fontSize: "clamp(64px, 11vw, 126px)",
          lineHeight: 0.9,
          letterSpacing: "0.05em",
          color: "#ffffff",
          userSelect: "none",
          textShadow: "0 2px 28px rgba(0,0,0,0.8), 0 0 60px rgba(238,205,2,0.25)",
        }}>
          Wonder<br />Land
        </h1>

        {/* Divider */}
        <div style={{
          width: 48, height: 2,
          background: "linear-gradient(90deg, #eecd02, #f50359)",
          borderRadius: 2,
          margin: "20px auto 0",
          opacity: 0.85,
        }} />

        {/* Progress bar */}
        <div style={{
          width: 240, height: 3,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 999,
          margin: "28px auto 8px",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: "linear-gradient(90deg, #eecd02 0%, #f59200 50%, #f50359 100%)",
            borderRadius: 999,
            transition: "width 0.18s ease-out",
            boxShadow: "0 0 8px rgba(238,205,2,0.6)",
          }} />
        </div>

        {/* Spinner + % */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 18, marginBottom: 24,
        }}>
          <div style={{ position: "relative", width: 86, height: 14, display: "inline-block" }}>
            {[
              { left: 8,  anim: "kSpinIn 0.5s cubic-bezier(0,1,1,0) infinite" },
              { left: 8,  anim: "kSpinSlide 0.5s cubic-bezier(0,1,1,0) infinite" },
              { left: 36, anim: "kSpinSlide 0.5s cubic-bezier(0,1,1,0) infinite" },
              { left: 64, anim: "kSpinOut 0.5s cubic-bezier(0,1,1,0) infinite" },
            ].map((d, i) => (
              <span key={i} style={{
                position: "absolute", top: 0, left: d.left,
                width: 13, height: 13, borderRadius: "50%",
                background: i % 2 === 0 ? "#eecd02" : "rgba(255,255,255,0.65)",
                animation: d.anim,
              }} />
            ))}
          </div>
          <span style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
            fontSize: "1.1rem", letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.65)",
          }}>
            {progress}%
          </span>
        </div>

        {/* Facts section OR Enter button */}
        {!(showEnter && progress >= 80) ? (
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.10)",
            paddingTop: 20,
            minHeight: 88,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 8,
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "rgba(238,205,2,0.65)",
              fontFamily: "system-ui, sans-serif", fontWeight: 600,
              marginBottom: 4,
            }}>
              Did you know?
            </div>
            <div style={{
              opacity: factVisible ? 1 : 0,
              transform: factVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.38s ease, transform 0.38s ease",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{fact.emoji}</span>
              <p style={{
                margin: 0,
                fontSize: 12.5,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.82)",
                fontFamily: "system-ui, sans-serif",
                fontWeight: 400,
                maxWidth: 340,
                textAlign: "center",
              }}>
                {fact.text}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 24, animation: "enterPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both" }}>
            <button
              onClick={onEnter}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                padding: "14px 52px",
                border: "1.5px solid rgba(255,255,255,0.30)",
                borderRadius: 14,
                background: btnHover ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                color: "#ffffff",
                cursor: "pointer",
                fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                fontSize: "1.25rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                boxShadow: btnHover
                  ? "0 8px 36px rgba(238,205,2,0.35), inset 0 1px 0 rgba(255,255,255,0.25)"
                  : "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                transform: btnHover ? "translateY(-2px) scale(1.03)" : "none",
                transition: "all 0.22s cubic-bezier(0.175,0.885,0.32,1.275)",
              }}
            >
              Enter
            </button>
          </div>
        )}
      </div>

      {/* Bottom-right version + copyright */}
      <div style={{
        position: "absolute", bottom: 18, right: 22, zIndex: 3,
        textAlign: "right",
        fontFamily: "system-ui, sans-serif",
        fontSize: 11,
        lineHeight: 1.6,
        color: "rgba(255,255,255,0.55)",
        letterSpacing: "0.04em",
        userSelect: "none",
        textShadow: "0 1px 6px rgba(0,0,0,0.8)",
      }}>
        <div>v1.0.0</div>
        <div>© {new Date().getFullYear()} Wonder Land</div>
      </div>

      <style>{`
        @keyframes enterPop {
          0%   { opacity:0; transform: scale(0.88) translateY(10px); }
          100% { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes kSpinIn {
          0%   { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes kSpinSlide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(28px); }
        }
        @keyframes kSpinOut {
          0%   { transform: scale(1); }
          100% { transform: scale(0); }
        }
      `}</style>
    </div>
  );
}
