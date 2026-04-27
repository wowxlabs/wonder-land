"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { InfoPoint } from "@/store/useExperienceStore";

interface Props {
  infoPoint: InfoPoint;
  onInteract: (point: InfoPoint) => void;
  avatarNear: boolean;
}

const NPC_COLORS: Record<string, { body: string; skin: string; accent: string }> = {
  "sig-3": { body: "#3b6ea5", skin: "#c4956a", accent: "#fbbf24" },
  "ella-3": { body: "#2d6a4f", skin: "#b5835a", accent: "#f97316" },
  "galle-3": { body: "#6a2d6a", skin: "#a0725c", accent: "#e879f9" },
  "kandy-3": { body: "#a35228", skin: "#c4956a", accent: "#fde047" },
  "nuwara-3": { body: "#1e4d8c", skin: "#9c6245", accent: "#34d399" },
  "jaffna-3": { body: "#7a2d2d", skin: "#b5835a", accent: "#fb923c" },
  "anu-3": { body: "#4a3728", skin: "#c4956a", accent: "#a78bfa" },
  "col-3": { body: "#1a4d3a", skin: "#a0725c", accent: "#38bdf8" },
  "yala-3": { body: "#2d4a1e", skin: "#9c6245", accent: "#84cc16" },
  "adam-3": { body: "#4a3060", skin: "#c4956a", accent: "#f43f5e" },
  "pol-3": { body: "#5a4a28", skin: "#b5835a", accent: "#fb923c" },
};

export default function NPCCharacter({ infoPoint, onInteract, avatarNear }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const [px, , pz] = infoPoint.position;
  const colors = NPC_COLORS[infoPoint.id] ?? { body: "#4a6a8a", skin: "#c4956a", accent: "#38bdf8" };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2 + px) * 0.03;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[px, 0, pz]}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 8, 16]} />
        <meshStandardMaterial color={colors.body} roughness={0.6} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={colors.skin} roughness={0.6} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.07, 1.46, 0.17]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.07, 1.46, 0.17]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.12, 0.24, 0]}>
        <capsuleGeometry args={[0.08, 0.32, 4, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      <mesh position={[0.12, 0.24, 0]}>
        <capsuleGeometry args={[0.08, 0.32, 4, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>

      {/* Accent glow when avatar is near */}
      {avatarNear && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.8}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}

      {/* Interaction prompt */}
      {avatarNear && (
        <Html position={[0, 2.2, 0]} center style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(5,15,35,0.9)",
              border: `1px solid ${colors.accent}60`,
              borderRadius: 8,
              padding: "5px 12px",
              whiteSpace: "nowrap",
              boxShadow: `0 0 16px ${colors.accent}40`,
              animation: "pulse-glow 1.5s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 11, color: colors.accent, fontWeight: 700 }}>
              [E] Talk to {infoPoint.npcName ?? "NPC"}
            </span>
          </div>
        </Html>
      )}

      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 12]} />
        <meshStandardMaterial color="#000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
