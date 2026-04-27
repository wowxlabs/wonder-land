"use client";
import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { sampleTerrainHeight } from "@/lib/terrain";

interface Props {
  modelPath: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  yOffset?: number;
  color?: string;
}

export default function MapFarmBuilding({
  modelPath,
  position,
  rotationY = 0,
  scale = 0.003,
  yOffset = 0,
  color = "#7a9460",
}: Props) {
  const fbx   = useLoader(FBXLoader, modelPath);
  const clone = useMemo(() => fbx.clone(true), [fbx]);

  useEffect(() => {
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => { if (mat) mat.needsUpdate = true; });
    });
  }, [clone]);

  const [px, , pz] = position;
  const py = sampleTerrainHeight(px, pz) + yOffset;

  return (
    <group position={[px, py, pz]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  );
}
