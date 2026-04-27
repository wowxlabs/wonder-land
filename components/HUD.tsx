"use client";
import { useExperienceStore } from "@/store/useExperienceStore";
import { Place } from "@/data/places";

interface Props {
  onBackToMap?: () => void;
  currentPlace?: Place | null;
  musicOn?: boolean;
  onToggleMusic?: () => void;
  rotationEnabled?: boolean;
  onToggleRotation?: () => void;
}

function playTone(freq: number, freq2: number, duration: number, type: OscillatorType = "sine") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freq2 !== freq) osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + duration * 0.7);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch { /* autoplay policy — silent fail */ }
}

function playMusicOn()    { playTone(660, 1320, 0.18); }
function playMusicOff()   { playTone(440, 220,  0.16); }
function playRotateOn()   { playTone(520, 780,  0.14, "triangle"); }
function playRotateOff()  { playTone(380, 260,  0.14, "triangle"); }

export default function HUD({ onBackToMap, currentPlace, musicOn, onToggleMusic, rotationEnabled = true, onToggleRotation }: Props) {
  const { phase, selectedAvatar, setSelectedAvatar, nearbyPlace } = useExperienceStore();
  const isPlaceMode  = phase === "place";
  const isMapMode    = phase === "map";
  const isPlayerMode = isMapMode && selectedAvatar !== null;

  function handleToggleMusic() {
    musicOn ? playMusicOff() : playMusicOn();
    onToggleMusic?.();
  }

  function handleToggleRotation() {
    rotationEnabled ? playRotateOff() : playRotateOn();
    onToggleRotation?.();
  }

  return (
    <>
      <style>{`
        @keyframes hud-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(28,34,140,0.45), 0 4px 18px rgba(28,34,140,0.22); }
          50%       { box-shadow: 0 0 0 7px rgba(28,34,140,0), 0 4px 18px rgba(28,34,140,0.35); }
        }
        @keyframes hud-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hud-btn {
          position: relative;
          width: 46px; height: 46px;
          border-radius: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.92);
          border: 2px solid rgba(28,34,140,0.25);
          box-shadow: 0 4px 18px rgba(28,34,140,0.15);
          transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275),
                      box-shadow 0.25s ease,
                      background 0.25s ease,
                      border-color 0.25s ease;
        }
        .hud-btn:hover  { transform: scale(1.1) translateY(-1px); border-color: #f50359 !important; box-shadow: 0 6px 22px rgba(245,3,89,0.25); }
        .hud-btn:active { transform: scale(0.93); }

        .hud-btn-music-off { border-color: rgba(28,34,140,0.25); }
        .hud-btn-music-off:hover { border-color: rgba(28,34,140,0.5); background: #fff; }

        .hud-btn-music-on {
          background: #fff;
          border-color: #1c228c;
          box-shadow: 0 0 0 0 rgba(28,34,140,0.4), 0 4px 18px rgba(28,34,140,0.22);
          animation: hud-pulse 2s ease-in-out infinite;
        }
        .hud-btn-music-on:hover { background: #f0f2ff; border-color: #1c228c; }

        .hud-btn-rotate-on {
          background: #1c228c;
          border-color: #1c228c;
          box-shadow: 0 4px 18px rgba(28,34,140,0.35);
        }
        .hud-btn-rotate-on:hover { background: #2a33c0; box-shadow: 0 6px 24px rgba(28,34,140,0.45); }

        .hud-btn-rotate-off { border-color: rgba(28,34,140,0.25); }
        .hud-btn-rotate-off:hover { border-color: rgba(28,34,140,0.5); background: #fff; }

        .hud-rotate-icon { transition: transform 0.4s ease; }
        .hud-btn-rotate-on .hud-rotate-icon { animation: hud-spin 3s linear infinite; }
      `}</style>


      {/* Player mode: exit button fixed top-right */}
      {isPlayerMode && (
        <button
          onClick={() => setSelectedAvatar(null)}
          title="Exit gameplay (Esc)"
          className="fixed top-5 right-5 z-50 btn-kode btn-kode-blue"
          style={{ padding: "10px 22px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 7 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Exit
        </button>
      )}

      {/* Top right: Sound + rotation toggles */}
      <div className={`fixed z-30 ${isPlayerMode ? "top-5 right-24" : "top-5 right-5"}`} style={{ display: "flex", gap: 10 }}>
        {isMapMode && !isPlayerMode && (
          <button
            onClick={handleToggleRotation}
            title={rotationEnabled ? "Stop rotation" : "Start rotation"}
            className={`hud-btn ${rotationEnabled ? "hud-btn-rotate-on" : "hud-btn-rotate-off"}`}
          >
            <span className="hud-rotate-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={rotationEnabled ? "#fff" : "#1c228c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6" />
                <path d="M2.5 12a9 9 0 0 1 15-6.7L21.5 8" />
                <path d="M2.5 22v-6h6" />
                <path d="M21.5 12a9 9 0 0 1-15 6.7L2.5 16" />
              </svg>
            </span>
          </button>
        )}

        <button
          onClick={handleToggleMusic}
          title={musicOn ? "Mute music" : "Play music"}
          className={`hud-btn ${musicOn ? "hud-btn-music-on" : "hud-btn-music-off"}`}
        >
          {musicOn ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c228c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(28,34,140,0.12)" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c228c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </div>

      {/* Map mode: explore hint / player controls / nearby-place banner */}
      {isMapMode && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

          {/* Nearby place banner — slides in when player is close to a marker */}
          {isPlayerMode && nearbyPlace && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(16px)",
              border: `2px solid ${nearbyPlace.color}`,
              borderRadius: 16,
              padding: "12px 22px",
              boxShadow: `0 8px 32px ${nearbyPlace.color}44`,
              animation: "hud-pulse 2s ease-in-out infinite",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", border: `2px solid ${nearbyPlace.color}`, flexShrink: 0 }}>
                <img
                  src={nearbyPlace.thumbnail}
                  alt={nearbyPlace.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1c228c", fontFamily: "system-ui" }}>
                  {nearbyPlace.name}
                </div>
                <div style={{ fontSize: 10, color: "#5a6080", fontFamily: "system-ui" }}>
                  {nearbyPlace.tagline}
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: nearbyPlace.color, color: "#fff",
                borderRadius: 999, padding: "5px 14px",
                fontSize: 11, fontWeight: 700, fontFamily: "system-ui",
                letterSpacing: "0.06em",
              }}>
                <span style={{
                  background: "rgba(255,255,255,0.25)", borderRadius: 4,
                  padding: "1px 6px", fontSize: 11, fontWeight: 700,
                }}>E</span>
                Explore
              </div>
            </div>
          )}

          {/* Controls strip */}
          {isPlayerMode ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(28,34,140,0.22)",
              borderRadius: 999,
              padding: "8px 22px",
              boxShadow: "0 4px 18px rgba(28,34,140,0.14)",
            }}>
              {[["W","↑"],["A","←"],["S","↓"],["D","→"]].map(([k,a]) => (
                <span key={k} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <span style={{
                    background: "#1c228c", color: "#fff",
                    borderRadius: 5, padding: "1px 6px",
                    fontSize: 9, fontWeight: 700, fontFamily: "system-ui",
                    letterSpacing: "0.05em",
                  }}>{k}</span>
                  <span style={{ fontSize: 8, color: "#8090b0", fontFamily: "system-ui" }}>{a}</span>
                </span>
              ))}
              <span style={{ width: 1, height: 22, background: "rgba(28,34,140,0.15)", margin: "0 4px" }} />
              <span style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                fontSize: "0.9rem", letterSpacing: "0.12em", color: "#1c228c",
              }}>
                Walk &amp; Explore
              </span>
            </div>
          ) : (
            <div style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(28,34,140,0.18)",
              borderRadius: 999,
              padding: "10px 28px",
              fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
              fontSize: "1rem", letterSpacing: "0.15em", color: "#1c228c",
              boxShadow: "0 4px 18px rgba(28,34,140,0.12)",
            }}>
              Click a marker to explore
            </div>
          )}
        </div>
      )}

      {/* Place mode: top title + back */}
      {isPlaceMode && (
        <>
          {currentPlace && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-30">
              <div style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                border: `2px solid ${currentPlace.color}`,
                borderRadius: 999,
                padding: "8px 28px",
                textAlign: "center",
                boxShadow: `0 4px 20px ${currentPlace.color}44`,
              }}>
                <div style={{
                  fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                  fontSize: "1.15rem", letterSpacing: "0.12em", color: "#1c228c",
                }}>
                  {currentPlace.icon} {currentPlace.name}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#f50359", marginTop: 2, letterSpacing: "0.05em" }}>
                  {currentPlace.tagline}
                </div>
              </div>
            </div>
          )}

          {onBackToMap && (
            <button
              className="btn-kode btn-kode-blue fixed bottom-7 right-5 z-30"
              onClick={onBackToMap}
              style={{ padding: "12px 28px", fontSize: "1rem" }}
            >
              ← Back to Map
            </button>
          )}
        </>
      )}
    </>
  );
}
