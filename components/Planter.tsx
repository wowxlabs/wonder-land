"use client";
import { useMemo } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import { idlePreload } from "@/lib/preload";
import type { GLTF } from "three-stdlib";
import { sampleTerrainHeight } from "@/lib/terrain";

const FLOWER_MODELS = [
  "/models/nature/Flower_3_Group.gltf",
  "/models/nature/Flower_4_Group.gltf",
  "/models/nature/Flower_1_Group.gltf",
  "/models/nature/Flower_7_Group.gltf",
];

interface Props {
  position: [number, number, number];
  flowerIndex?: number;
}

export default function Planter({ position, flowerIndex = 0 }: Props) {
  const modelPath = FLOWER_MODELS[flowerIndex % FLOWER_MODELS.length];
  const { scene } = useGLTF(modelPath) as GLTF;
  const [px, , pz] = position;
  const py = useMemo(() => sampleTerrainHeight(px, pz), [px, pz]);

  return (
    <group position={[px, py, pz]}>
      {/* Terracotta pot */}
      <mesh position={[0, 0.022, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.042, 0.044, 10]} />
        <meshStandardMaterial color="#c1440e" roughness={0.85} />
      </mesh>
      {/* Soil top */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.004, 10]} />
        <meshStandardMaterial color="#5c3a1e" roughness={1} />
      </mesh>
      {/* Flowers */}
      <Clone object={scene} scale={0.028} position={[0, 0.046, 0]} />
    </group>
  );
}

idlePreload(FLOWER_MODELS);
