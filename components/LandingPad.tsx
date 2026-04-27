"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { sampleTerrainHeight } from "@/lib/terrain";

interface Props {
  position: [number, number, number];
  onPress: () => void;
}

export default function LandingPad({ position, onPress }: Props) {
  const [hovered, setHovered] = useState(false);
  const ringRef  = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const timeRef  = useRef(0);

  const [px, , pz] = position;
  const py = sampleTerrainHeight(px, pz);

  const accent = hovered ? "#f50359" : "#1c228c";

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.8;
    }
    if (outerRef.current) {
      outerRef.current.scale.setScalar(1 + Math.sin(t * 2.8) * 0.1);
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(t * 2.8) * 0.28;
    }
  });

  return (
    <group
      position={[px, py + 0.07, pz]}
      onClick={(e) => { e.stopPropagation(); onPress(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = "pointer"; }}
      onPointerOut={(e)  => { e.stopPropagation(); setHovered(false); document.body.style.cursor = ""; }}
    >
      {/* Concentric decorative rings on surface */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.27, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.17, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>

      {/* Spinning segmented ring */}
      <mesh ref={ringRef} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.013, 8, 6]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Pulsing outer ring */}
      <mesh ref={outerRef} position={[0, 0.010, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.29, 0.007, 8, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>

      {/* Centre icon disk */}
      <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 32]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Person silhouette — head dot + body rectangle */}
      <mesh position={[0, 0.018, -0.01]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[0, 0.018, 0.02]}>
        <boxGeometry args={[0.028, 0.038, 0.008]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* Hover label */}
      {hovered && (
        <Html
          position={[0, 0.30, 0]}
          center
          distanceFactor={4}
          style={{ pointerEvents: "none" }}
        >
          <div style={{
            background: "#f50359",
            color: "#fff",
            border: "2px solid #f50359",
            borderRadius: 999,
            padding: "4px 14px",
            fontSize: 10,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(245,3,89,0.4)",
            textTransform: "uppercase",
          }}>
            Click me
          </div>
        </Html>
      )}
    </group>
  );
}
