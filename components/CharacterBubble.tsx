"use client";
import { Html } from "@react-three/drei";
import { sampleTerrainHeight } from "@/lib/terrain";

interface Props {
  position: [number, number, number];
  content: string;
  yOffset?: number;
}

export default function CharacterBubble({ position, content, yOffset = 0.22 }: Props) {
  const [px, , pz] = position;
  const py = sampleTerrainHeight(px, pz) + yOffset;

  return (
    <Html
      position={[px, py, pz]}
      center
      occlude={false}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <div style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        border: "2px solid rgba(28,34,140,0.18)",
        borderRadius: "50%",
        width: 28, height: 28,
        fontSize: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        animation: "bubbleFloat 2.4s ease-in-out infinite alternate",
      }}>
        {content}
        {/* Tail */}
        <div style={{
          position: "absolute",
          bottom: -7,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "7px solid rgba(28,34,140,0.18)",
        }} />
        <div style={{
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "6px solid #fff",
        }} />
      </div>
      <style>{`
        @keyframes bubbleFloat {
          0%   { transform: translateY(0px);   }
          100% { transform: translateY(-4px);  }
        }
      `}</style>
    </Html>
  );
}
