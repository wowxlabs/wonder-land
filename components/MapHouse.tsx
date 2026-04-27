"use client";
import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { sampleTerrainHeight } from "@/lib/terrain";

const TEXTURE_PATH = "/models/houses/House_texture_atlas.png";

interface Props {
  modelPath?: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  yOffset?: number;
}

export default function MapHouse({
  modelPath = "/models/houses/House_01_full.fbx",
  position,
  rotationY = 0,
  scale = 0.05,
  yOffset = 0,
}: Props) {
  const fbx     = useLoader(FBXLoader, modelPath);
  const texture = useLoader(THREE.TextureLoader, TEXTURE_PATH);

  const clone = useMemo(() => fbx.clone(true), [fbx]);

  useEffect(() => {
    texture.flipY = false;
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      mesh.material = new THREE.MeshLambertMaterial({
        map:   texture,
        color: new THREE.Color("#8fa870"), // mossy green-wood tint multiplied over texture
      });
    });
  }, [clone, texture]);

  const [px, , pz] = position;
  const py = sampleTerrainHeight(px, pz) + yOffset;

  return (
    <group position={[px, py, pz]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  );
}
