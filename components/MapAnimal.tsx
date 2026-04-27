"use client";
import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone as cloneScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { GLTF } from "three-stdlib";
import * as THREE from "three";
import { sampleTerrainHeight } from "@/lib/terrain";

interface Props {
  modelPath: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  yOffset?: number;
  phaseOffset?: number;
}

export default function MapAnimal({
  modelPath,
  position,
  rotationY = 0,
  scale = 0.5,
  yOffset = 0,
  phaseOffset = 0,
}: Props) {
  const gltf = useGLTF(modelPath) as GLTF;
  const clone = useMemo(() => cloneScene(gltf.scene) as THREE.Group, [gltf.scene]);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef  = useRef(phaseOffset);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!groupRef.current) return;

    const t = timeRef.current;
    // Peck cycle: fast tilt down, slow raise back up
    const cycle = (t % 2.0) / 2.0; // 0→1 over 2 seconds
    let tilt: number;
    if (cycle < 0.15) {
      tilt = (cycle / 0.15) * 0.55;        // snap down
    } else if (cycle < 0.35) {
      tilt = 0.55;                          // hold at bottom (beak on ground)
    } else if (cycle < 0.65) {
      tilt = 0.55 * (1 - (cycle - 0.35) / 0.30); // raise back up
    } else {
      tilt = 0;                             // idle upright
    }
    groupRef.current.rotation.x = tilt;
  });

  const [px, , pz] = position;
  const py = sampleTerrainHeight(px, pz) + yOffset;

  return (
    <group ref={groupRef} position={[px, py, pz]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  );
}
