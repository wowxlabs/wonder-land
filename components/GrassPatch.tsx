"use client";
import { useMemo } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import { edgeDist, pip, sampleTerrainHeight } from "@/lib/terrain";

const MODELS = [
  "/models/nature/Grass_Common_Short.gltf",
  "/models/nature/Grass_Common_Tall.gltf",
  "/models/nature/Grass_Wide_Short.gltf",
  "/models/nature/Grass_Wispy_Short.gltf",
];

const MODELS_ALT = [
  "/models/nature/Grass_1_A_Color1.gltf",
  "/models/nature/Grass_1_B_Color1.gltf",
  "/models/nature/Grass_2_A_Color1.gltf",
  "/models/nature/Grass_2_C_Color1.gltf",
];

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
}

interface Props {
  cx: number;
  cz: number;
  radius?: number;
  count?: number;
  scale?: number;
  seed?: number;
  alt?: boolean;
  clipToIsland?: boolean;
  minEdge?: number;
}

export default function GrassPatch({
  cx,
  cz,
  radius = 0.35,
  count = 10,
  scale = 0.032,
  seed = 1,
  alt = false,
  clipToIsland = true,
  minEdge = 0.12,
}: Props) {
  const modelSet = alt ? MODELS_ALT : MODELS;
  const loaded = modelSet.map(m => (useGLTF(m) as GLTF).scene);

  const blades = useMemo(() => {
    const r = lcg(seed);
    const placed = [];
    const maxAttempts = Math.max(count * 10, 40);

    for (let i = 0; placed.length < count && i < maxAttempts; i++) {
      const angle = r() * Math.PI * 2;
      const dist  = r() * radius;
      const x     = cx + Math.cos(angle) * dist;
      const z     = cz + Math.sin(angle) * dist;
      const edgePadding = minEdge + scale * 2;

      if (clipToIsland && (!pip(x, z) || edgeDist(x, z) < edgePadding)) {
        continue;
      }

      const y     = sampleTerrainHeight(x, z);
      placed.push({ x, y, z, rot: r() * Math.PI * 2, s: scale * (0.8 + r() * 0.4), model: placed.length % modelSet.length });
    }

    return placed;
  }, [clipToIsland, count, cx, cz, minEdge, modelSet.length, radius, scale, seed]);

  return (
    <group>
      {blades.map((b, i) => (
        <Clone
          key={i}
          object={loaded[b.model]}
          position={[b.x, b.y, b.z]}
          rotation={[0, b.rot, 0]}
          scale={b.s}
        />
      ))}
    </group>
  );
}

MODELS.forEach(m => useGLTF.preload(m));
MODELS_ALT.forEach(m => useGLTF.preload(m));
