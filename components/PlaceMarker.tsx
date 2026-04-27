"use client";
import { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Place } from "@/data/places";
import { sampleTerrainHeight, pip } from "@/lib/terrain";
import { playHoverSound } from "@/lib/hoverSound";

interface Props {
  place: Place;
  onClick: (place: Place) => void;
  isSelected: boolean;
}

// Module-level reusables — useFrame is sequential so sharing is safe
const _v    = new THREE.Vector3();
const _ray  = new THREE.Raycaster();
const _ndc  = new THREE.Vector2();

/**
 * Cast a ray from the camera through the label's screen position,
 * then march past the label until we hit the terrain surface.
 * Returns the screen-Y (CSS pixels from top) of that hit point.
 * This gives the "ground directly below the label" from the camera's POV,
 * which is what the vertical CSS line should reach regardless of camera angle.
 */
function groundScreenY(
  camera: THREE.Camera,
  labelPos: THREE.Vector3,
  size: { width: number; height: number }
): number {
  _v.copy(labelPos).project(camera);
  _ndc.set(_v.x, _v.y);
  _ray.setFromCamera(_ndc, camera);

  const origin    = _ray.ray.origin;
  const direction = _ray.ray.direction;
  const startT    = labelPos.distanceTo(origin) + 0.15; // begin just past the label

  for (let dt = 0; dt < 16; dt += 0.18) {
    const t  = startT + dt;
    const wx = origin.x + direction.x * t;
    const wz = origin.z + direction.z * t;
    const wy = origin.y + direction.y * t;
    if (wy < -0.2) break;
    if (pip(wx, wz) && wy <= sampleTerrainHeight(wx, wz) + 0.12) {
      _v.set(wx, wy, wz).project(camera);
      return (1 - _v.y) / 2 * size.height;
    }
  }

  // Fallback: project sea-level point directly below label
  _v.set(labelPos.x, 0, labelPos.z).project(camera);
  return (1 - _v.y) / 2 * size.height;
}

export default function PlaceMarker({ place, onClick, isSelected }: Props) {
  const [hovered, setHovered] = useState(false);
  const bobRef    = useRef<THREE.Group>(null);
  const lineElRef = useRef<HTMLDivElement>(null);
  const dotElRef  = useRef<HTMLDivElement>(null);
  const labelPos  = useMemo(() => new THREE.Vector3(), []);
  const [px, , pz] = place.position;
  const py = useMemo(() => sampleTerrainHeight(px, pz) + 0.04, [px, pz]);
  const active = hovered || isSelected;
  const { camera, size } = useThree();

  useFrame(({ clock }) => {
    const t    = clock.getElapsedTime();
    const bobY = py + 0.36 + Math.sin(t * 1.6) * 0.05;
    if (bobRef.current) bobRef.current.position.y = bobY;

    // Anchor screen Y — projection of the bob position (= triangle tip)
    _v.set(px, bobY, pz).project(camera);
    const anchorY = (1 - _v.y) / 2 * size.height;

    // Ground screen Y — raycast through the label to terrain surface
    labelPos.set(px, bobY, pz);
    const gY = groundScreenY(camera, labelPos, size);

    const lineH = Math.max(0, gY - anchorY);

    if (lineElRef.current) {
      lineElRef.current.style.height  = `${lineH}px`;
      lineElRef.current.style.opacity = active
        ? String(0.80 + Math.sin(t * 3.0) * 0.15)
        : String(0.40 + Math.sin(t * 2.0) * 0.12);
    }

    if (dotElRef.current) {
      const speed = active ? 0.85 : 1.4;
      const frac  = (t % speed) / speed;
      dotElRef.current.style.top     = `${frac * lineH - 3}px`;
      dotElRef.current.style.opacity = String(
        Math.sin(frac * Math.PI) * (active ? 1.0 : 0.55)
      );
    }
  });

  const borderColor = active ? place.color : "rgba(28,34,140,0.15)";

  return (
    <group
      position={[px, py, pz]}
      onPointerEnter={() => { setHovered(true); playHoverSound(); }}
      onPointerLeave={() => setHovered(false)}
      onClick={() => onClick(place)}
    >
      <group ref={bobRef}>
        <Html position={[0, 0, 0]} occlude={false} zIndexRange={[20, 0]} style={{ userSelect: "none" }}>
          <div
            onMouseEnter={() => { if (!hovered) { setHovered(true); playHoverSound(); } }}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onClick(place)}
            style={{
              cursor: "pointer",
              position: "relative",
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            {/* Label column */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Pill */}
              <div style={{
                background: "#ffffff",
                border: `2.5px solid ${borderColor}`,
                borderRadius: active ? 14 : 999,
                padding: active ? "6px 14px 6px 6px" : "5px 12px 5px 5px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                boxShadow: active
                  ? `0 6px 24px rgba(28,34,140,0.22), 0 2px 8px ${place.color}55`
                  : "0 3px 14px rgba(28,34,140,0.14)",
                transform: active ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.2s, border-color 0.2s, border-radius 0.2s",
              }}>
                {/* Thumbnail — square with rounded corners */}
                <div style={{
                  width: active ? 44 : 28, height: active ? 44 : 28,
                  borderRadius: active ? 8 : "50%",
                  overflow: "hidden", flexShrink: 0,
                  border: `2px solid ${place.color}`,
                  transition: "width 0.2s, height 0.2s, border-radius 0.2s",
                }}>
                  <img
                    src={place.thumbnail}
                    alt={place.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = "none";
                      const fb = t.nextElementSibling as HTMLElement | null;
                      if (fb) fb.style.display = "flex";
                    }}
                  />
                  {/* Fallback emoji shown only if image fails */}
                  <span style={{
                    display: "none", alignItems: "center", justifyContent: "center",
                    width: "100%", height: "100%", background: place.color, fontSize: 13,
                  }}>
                    {place.icon}
                  </span>
                </div>

                <div>
                  <div style={{
                    fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                    fontSize: 15, letterSpacing: "0.1em", color: "#1c228c", lineHeight: 1,
                  }}>
                    {place.name.toUpperCase()}
                  </div>
                  {active && (
                    <div style={{
                      fontSize: 9, color: "#f50359", letterSpacing: "0.06em",
                      marginTop: 2, fontFamily: "system-ui, sans-serif",
                      fontWeight: 600, textTransform: "uppercase",
                    }}>
                      {place.tagline}
                    </div>
                  )}
                </div>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: place.color, flexShrink: 0,
                  boxShadow: `0 0 6px ${place.color}`,
                }} />
              </div>

              {/* Triangle — 10px tall so tip is the container bottom = 3D anchor */}
              <div style={{ position: "relative", width: 18, height: 10, flexShrink: 0 }}>
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "9px solid transparent", borderRight: "9px solid transparent",
                  borderTop: `10px solid ${borderColor}`, transition: "border-top-color 0.2s",
                }} />
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
                  borderTop: "8px solid #ffffff",
                }} />
              </div>
            </div>

            {/* Line + dot — anchored at triangle tip via top:"100%" */}
            <div style={{
              position: "absolute", top: "100%", left: "50%",
              transform: "translateX(-50%)",
              width: 0, overflow: "visible", pointerEvents: "none",
            }}>
              <div ref={lineElRef} style={{
                position: "absolute", top: 0,
                left: "50%", transform: "translateX(-50%)",
                width: 2, height: 0,
                background: "linear-gradient(to bottom, #ff2020, #ff202077)",
                borderRadius: 1,
              }} />
              <div ref={dotElRef} style={{
                position: "absolute", top: 0,
                left: "50%", transform: "translateX(-50%)",
                width: 6, height: 6, borderRadius: "50%",
                background: "#ff6060", boxShadow: "0 0 5px #ff2020",
              }} />
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}
