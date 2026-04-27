"use client";
import { useEffect, useState } from "react";
import { Avatar, AVATARS } from "@/data/avatars";
import { useExperienceStore } from "@/store/useExperienceStore";

function AvatarIllustration({ avatar }: { avatar: Avatar }) {
  const skin   = avatar.skinColor;
  const body   = avatar.primaryColor;
  const pants  = avatar.secondaryColor;
  const accent = avatar.accentColor;
  const isGirl = avatar.gender === "girl";

  return (
    <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Shadow */}
      <ellipse cx="50" cy="192" rx="22" ry="5" fill="rgba(0,0,0,0.10)" />

      {/* --- Hat (boy) --- */}
      {avatar.accessory === "hat" && (
        <>
          <rect x="32" y="14" width="36" height="6" rx="2" fill={accent} />
          <rect x="37" y="2" width="26" height="14" rx="4" fill={accent} />
        </>
      )}

      {/* --- Head --- */}
      <polygon points="50,20 65,25 70,38 65,52 50,56 35,52 30,38 35,25" fill={skin} />

      {/* Eyes */}
      <circle cx="42" cy="38" r="3.5" fill="#fff" />
      <circle cx="58" cy="38" r="3.5" fill="#fff" />
      <circle cx="43" cy="39" r="1.8" fill="#2d1a0e" />
      <circle cx="59" cy="39" r="1.8" fill="#2d1a0e" />
      {/* Smile */}
      <path d="M44,47 Q50,52 56,47" stroke="#8a5a3a" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* --- Headband (girl) --- */}
      {avatar.accessory === "headband" && (
        <>
          <rect x="29" y="27" width="42" height="6" rx="3" fill={accent} opacity="0.9" />
          <circle cx="50" cy="30" r="4" fill={accent} />
          <circle cx="50" cy="30" r="2" fill="#fff" opacity="0.6" />
        </>
      )}

      {/* Hair */}
      {isGirl ? (
        /* Long hair */
        <>
          <polygon points="30,30 28,70 35,62 38,56 35,30" fill="#3d2510" />
          <polygon points="70,30 72,70 65,62 62,56 65,30" fill="#3d2510" />
          <polygon points="35,25 65,25 67,18 50,12 33,18" fill="#3d2510" />
        </>
      ) : (
        /* Short hat-covered hair */
        <polygon points="35,25 65,25 63,20 50,16 37,20" fill="#2d1a0e" />
      )}

      {/* --- Neck --- */}
      <rect x="45" y="54" width="10" height="8" rx="2" fill={skin} />

      {/* --- Body / Shirt --- */}
      <polygon points="28,62 72,62 78,110 22,110" fill={body} />

      {/* Collar */}
      <polygon points="45,62 55,62 52,72 48,72" fill={isGirl ? accent : "#fff"} opacity="0.8" />

      {/* Shirt detail line */}
      <line x1="50" y1="72" x2="50" y2="108" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

      {/* --- Left arm --- */}
      <polygon points="27,64 15,66 11,105 26,100" fill={body} />
      {/* Left hand */}
      <ellipse cx="12" cy="108" rx="5" ry="6" fill={skin} />

      {/* --- Right arm --- */}
      <polygon points="73,64 85,66 89,105 74,100" fill={body} />
      {/* Right hand */}
      <ellipse cx="88" cy="108" rx="5" ry="6" fill={skin} />

      {/* --- Belt --- */}
      <rect x="22" y="108" width="56" height="6" rx="2" fill="rgba(0,0,0,0.18)" />

      {/* --- Legs / Pants --- */}
      <polygon points="22,113 50,113 48,175 18,175" fill={pants} />
      <polygon points="50,113 78,113 82,175 52,175" fill={pants} />
      {/* Pants crease */}
      <line x1="34" y1="113" x2="32" y2="175" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <line x1="66" y1="113" x2="68" y2="175" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

      {/* --- Shoes --- */}
      <ellipse cx="33" cy="177" rx="16" ry="6" fill="#2d2d2d" />
      <ellipse cx="67" cy="177" rx="16" ry="6" fill="#2d2d2d" />
    </svg>
  );
}

function AvatarCard({ avatar, selected, onSelect }: {
  avatar: Avatar;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isActive = selected || hovered;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{
        width: 210,
        height: 300,
        borderRadius: 18,
        border: `2px solid ${isActive ? avatar.primaryColor : "rgba(28,34,140,0.18)"}`,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
        transform: isActive ? "translateY(-5px) scale(1.02)" : "none",
        boxShadow: isActive
          ? `0 16px 40px ${avatar.primaryColor}40`
          : "0 2px 14px rgba(28,34,140,0.12)",
      }}
    >
      {/* Illustration background */}
      <div style={{
        position: "absolute", inset: 0,
        background: isActive
          ? `radial-gradient(ellipse at 50% 30%, ${avatar.primaryColor}22 0%, ${avatar.secondaryColor}18 60%, #eef0ff 100%)`
          : `radial-gradient(ellipse at 50% 30%, ${avatar.primaryColor}12 0%, #eef0ff 100%)`,
        transition: "background 0.3s ease",
      }} />

      {/* Avatar illustration */}
      <div style={{
        position: "absolute",
        top: 8, left: "50%",
        width: 130, height: 165,
        transform: isActive ? "translateX(-50%) scale(1.06)" : "translateX(-50%) scale(1)",
        filter: isActive ? `drop-shadow(0 6px 14px ${avatar.primaryColor}55)` : "drop-shadow(0 3px 6px rgba(0,0,0,0.12))",
        transition: "all 0.3s ease",
      }}>
        <AvatarIllustration avatar={avatar} />
      </div>

      {/* Selected badge */}
      {selected && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 2,
          background: avatar.primaryColor, color: "#fff",
          borderRadius: 999, padding: "2px 9px",
          fontSize: 10, fontWeight: 700,
          fontFamily: "system-ui", letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          ✓ Active
        </div>
      )}

      {/* Glass info panel */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(255,255,255,0.6)",
        padding: "12px 14px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1c228c", fontFamily: "system-ui" }}>
            {avatar.name}
          </span>
          <span style={{ fontSize: 9, color: avatar.primaryColor, fontFamily: "system-ui", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            {avatar.title}
          </span>
        </div>
        <p style={{ fontSize: 11, color: "#5a6080", lineHeight: 1.5, margin: "0 0 10px", fontFamily: "system-ui" }}>
          {avatar.description}
        </p>
        <button style={{
          width: "100%", padding: "8px 0",
          borderRadius: 10,
          border: `1.5px solid ${isActive ? avatar.primaryColor : "rgba(28,34,140,0.2)"}`,
          background: selected ? avatar.primaryColor : isActive ? `${avatar.primaryColor}18` : "transparent",
          color: selected ? "#fff" : isActive ? avatar.primaryColor : "#8090b0",
          fontSize: 11, fontWeight: 700,
          fontFamily: "system-ui", letterSpacing: "0.07em",
          textTransform: "uppercase", cursor: "pointer",
          transition: "all 0.2s",
        }}>
          {selected ? `✓ Playing as ${avatar.name}` : `Choose ${avatar.name}`}
        </button>
      </div>
    </div>
  );
}

interface Props { onClose: () => void; }

export default function AvatarSelect({ onClose }: Props) {
  const { selectedAvatar, setSelectedAvatar } = useExperienceStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  function handleSelect(avatar: Avatar) {
    setSelectedAvatar(avatar);
    setTimeout(() => onClose(), 380);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,14,40,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 22,
        border: "2px solid rgba(28,34,140,0.18)",
        boxShadow: "0 24px 80px rgba(10,14,40,0.35)",
        padding: "26px 26px 26px",
        width: "calc(100vw - 48px)",
        maxWidth: 500,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
        transition: "transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
        position: "relative",
      }}>

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 30, height: 30, borderRadius: "50%",
            border: "1.5px solid rgba(28,34,140,0.18)",
            background: "transparent", color: "#8090b0",
            fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#f50359"; e.currentTarget.style.color = "#f50359"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,34,140,0.18)"; e.currentTarget.style.color = "#8090b0"; }}
        >✕</button>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f50359", margin: "0 0 5px", fontFamily: "system-ui", fontWeight: 600 }}>
            Your Journey Begins
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1c228c", margin: 0, fontFamily: "system-ui" }}>
            Choose Your Guide
          </h2>
          <div style={{ width: 34, height: 2, background: "#f50359", borderRadius: 2, margin: "8px auto 0" }} />
        </div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {AVATARS.map(avatar => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              selected={selectedAvatar?.id === avatar.id}
              onSelect={() => handleSelect(avatar)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
