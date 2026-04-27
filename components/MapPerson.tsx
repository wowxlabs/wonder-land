"use client";
import { useRef, useEffect, useMemo } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { sampleTerrainHeight } from "@/lib/terrain";

const TEXTURE_PATH = "/models/people/people_texture_map.png";

interface Props {
  modelPath: string;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  yOffset?: number;
  patrolPath?: [number, number][];
  patrolSpeed?: number;
  animSpeed?: number;
}

export default function MapPerson({
  modelPath,
  position = [0, 0, 0],
  rotationY = 0,
  scale = 0.09,
  yOffset = 0,
  patrolPath,
  patrolSpeed = 0.08,
  animSpeed = 0.35,
}: Props) {
  const fbx     = useLoader(FBXLoader, modelPath);
  const texture = useLoader(THREE.TextureLoader, TEXTURE_PATH);

  const clone = useMemo(() => {
    const c = cloneSkeleton(fbx) as THREE.Group;
    c.animations = fbx.animations;
    return c;
  }, [fbx]);

  // Apply the shared texture atlas to every mesh — FBX texture paths are
  // absolute from the exporter's machine so they never resolve in the browser
  useEffect(() => {
    texture.flipY = false; // FBX UV origin is bottom-left; Three.js expects top-left
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = new THREE.MeshLambertMaterial({ map: texture });
    });
  }, [clone, texture]);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const segRef   = useRef(0);
  const tRef     = useRef(0);

  useEffect(() => {
    if (!clone.animations?.length) return;
    const mixer = new THREE.AnimationMixer(clone);
    mixer.timeScale = animSpeed;
    mixerRef.current = mixer;
    mixer.clipAction(clone.animations[0]).play();
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [clone]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);

    if (!groupRef.current || !patrolPath || patrolPath.length < 2) return;

    const n = patrolPath.length;

    const a0 = patrolPath[segRef.current];
    const b0 = patrolPath[(segRef.current + 1) % n];
    const segLen = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]);
    tRef.current += (delta * patrolSpeed) / Math.max(segLen, 0.01);

    while (tRef.current >= 1) {
      tRef.current -= 1;
      segRef.current = (segRef.current + 1) % n;
    }

    const a = patrolPath[segRef.current];
    const b = patrolPath[(segRef.current + 1) % n];
    const t = tRef.current;
    const x = a[0] + (b[0] - a[0]) * t;
    const z = a[1] + (b[1] - a[1]) * t;

    groupRef.current.position.set(x, sampleTerrainHeight(x, z), z);
    groupRef.current.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
  });

  const [px, , pz] = position;
  const py = sampleTerrainHeight(px, pz) + yOffset;

  return (
    <group ref={groupRef} position={[px, py, pz]} rotation={[0, rotationY, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  );
}
