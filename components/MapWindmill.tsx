"use client";
import { useRef, useEffect, useMemo } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { sampleTerrainHeight } from "@/lib/terrain";

interface Props {
  modelPath: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  yOffset?: number;
  rotationSpeed?: number;
}

export default function MapWindmill({
  modelPath,
  position,
  rotationY = 0,
  scale = 0.0004,
  yOffset = 0.05,
  rotationSpeed = 0.8,
}: Props) {
  const fbx   = useLoader(FBXLoader, modelPath);
  const clone = useMemo(() => fbx.clone(true), [fbx]);

  const bladesRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => { if (mat) mat.needsUpdate = true; });
    });

    // Find blade mesh — try by name first, then fall back to largest non-root child
    let blades: THREE.Object3D | null = null;
    clone.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes("blade") || name.includes("sail") ||
          name.includes("prop") || name.includes("rotor") ||
          name.includes("wing") || name.includes("fan")) {
        blades = child;
      }
    });

    // Fallback: use the last direct child (blades are usually the top part)
    if (!blades && clone.children.length > 1) {
      blades = clone.children[clone.children.length - 1];
    }

    bladesRef.current = blades;
  }, [clone]);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const [px, , pz] = position;
  const py = sampleTerrainHeight(px, pz) + yOffset;

  return (
    <group position={[px, py, pz]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  );
}
