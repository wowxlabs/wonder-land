"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { InfoPoint } from "@/store/useExperienceStore";

interface Props {
  infoPoint: InfoPoint;
  onInteract: (point: InfoPoint) => void;
  avatarNear: boolean;
}

export default function InfoPointObject({ infoPoint, onInteract, avatarNear }: Props) {
  const ringRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const [px, py, pz] = infoPoint.position;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 1.5;
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
    if (sphereRef.current) {
      sphereRef.current.position.y = py + 0.5 + Math.sin(t * 2) * 0.1;
      (sphereRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1 + Math.sin(t * 3) * 0.5;
    }
  });

  const color = infoPoint.type === "info" ? "#38bdf8" : "#fbbf24";

  return (
    <group position={[px, 0, pz]}>
      {/* Column */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>

      {/* Floating info orb */}
      <mesh ref={sphereRef} position={[0, py + 0.5, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} roughness={0.1} metalness={0.4} />
      </mesh>

      {/* Orbiting ring */}
      <mesh ref={ringRef} position={[0, py + 0.5, 0]}>
        <torusGeometry args={[0.24, 0.025, 6, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.7} />
      </mesh>

      {/* Glow */}
      <mesh position={[0, py + 0.5, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.12} />
      </mesh>

      {/* Ground circle */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.24, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Prompt */}
      {avatarNear && (
        <Html position={[0, py + 1.2, 0]} center style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(5,15,35,0.9)",
              border: `1px solid ${color}60`,
              borderRadius: 8,
              padding: "5px 12px",
              whiteSpace: "nowrap",
              boxShadow: `0 0 16px ${color}40`,
            }}
          >
            <span style={{ fontSize: 11, color, fontWeight: 700 }}>
              [E] {infoPoint.title}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
