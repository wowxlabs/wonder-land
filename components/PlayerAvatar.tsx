"use client";
import { useRef, useEffect, useMemo } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { sampleTerrainHeight } from "@/lib/terrain";
import { useExperienceStore } from "@/store/useExperienceStore";
import { PLACES, Place } from "@/data/places";

const TEXTURE_PATH = "/models/people/people_texture_map.webp";

const MOVE_SPEED = 0.40;  // world units / second
const TURN_SPEED = 2.50;  // radians / second
const CAM_BACK   = 0.90;  // camera offset behind character
const CAM_HEIGHT = 0.60;  // camera height above terrain
const CAM_LERP    = 0.12;  // camera smoothing
const EXPLORE_DIST = 0.70;  // world units to trigger explore prompt

interface Props {
  name: string;
  onPlaceSelect: (place: Place) => void;
}

export default function PlayerAvatar({ name, onPlaceSelect }: Props) {
  const { setSelectedAvatar, setNearbyPlace } = useExperienceStore();
  const fbx     = useLoader(FBXLoader, "/models/people/peasant_1_walk.fbx");
  const texture = useLoader(THREE.TextureLoader, TEXTURE_PATH);

  const clone = useMemo(() => {
    const c = cloneSkeleton(fbx) as THREE.Group;
    c.animations = fbx.animations;
    return c;
  }, [fbx]);

  useEffect(() => {
    texture.flipY = false;
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = new THREE.MeshLambertMaterial({ map: texture });
    });
  }, [clone, texture]);

  const mixerRef   = useRef<THREE.AnimationMixer | null>(null);
  const groupRef   = useRef<THREE.Group>(null);
  const keysRef    = useRef<Set<string>>(new Set());
  const facingRef  = useRef(0);           // current heading (radians, Y axis)
  const camPosRef    = useRef(new THREE.Vector3());
  const camLookRef   = useRef(new THREE.Vector3());
  const isFirst      = useRef(true);
  const nearbyRef    = useRef<Place | null>(null);

  useEffect(() => {
    if (!clone.animations?.length) return;
    const mixer = new THREE.AnimationMixer(clone);
    mixer.timeScale = 0;
    mixerRef.current = mixer;
    mixer.clipAction(clone.animations[0]).play();
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [clone]);

  // Clear nearby place when exiting player mode
  useEffect(() => () => { setNearbyPlace(null); }, [setNearbyPlace]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") { setSelectedAvatar(null); setNearbyPlace(null); return; }
      if (k === "e" && nearbyRef.current) { onPlaceSelect(nearbyRef.current); return; }
      keysRef.current.add(k);
      if (["arrowup","arrowdown","arrowleft","arrowright"].includes(k))
        e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !mixerRef.current) return;

    const keys      = keysRef.current;
    const moveFwd   = keys.has("w") || keys.has("arrowup");
    const moveBack  = keys.has("s") || keys.has("arrowdown");
    const turnLeft  = keys.has("a") || keys.has("arrowleft");
    const turnRight = keys.has("d") || keys.has("arrowright");

    // Rotate character in place
    if (turnLeft)  facingRef.current += TURN_SPEED * delta;
    if (turnRight) facingRef.current -= TURN_SPEED * delta;

    // Move freely — terrain height keeps character on the surface
    const isMoving = moveFwd || moveBack;
    if (isMoving) {
      const dir = moveFwd ? 1 : -1;
      const nx = groupRef.current.position.x + Math.sin(facingRef.current) * dir * MOVE_SPEED * delta;
      const nz = groupRef.current.position.z + Math.cos(facingRef.current) * dir * MOVE_SPEED * delta;
      groupRef.current.position.set(nx, sampleTerrainHeight(nx, nz), nz);
    }
    groupRef.current.rotation.y = facingRef.current;

    // Drive walk animation
    mixerRef.current.timeScale = isMoving ? 0.35 : 0;
    mixerRef.current.update(delta);

    // ── Proximity check ───────────────────────────────────────────────────
    const pos = groupRef.current.position;
    let closest: Place | null = null;
    let closestDist = EXPLORE_DIST;
    for (const place of PLACES) {
      const d = Math.hypot(pos.x - place.position[0], pos.z - place.position[2]);
      if (d < closestDist) { closest = place; closestDist = d; }
    }
    if (closest?.id !== nearbyRef.current?.id) {
      nearbyRef.current = closest;
      setNearbyPlace(closest);
    }

    // ── Follow camera ──────────────────────────────────────────────────────
    const tx  = pos.x - Math.sin(facingRef.current) * CAM_BACK;
    const tz  = pos.z - Math.cos(facingRef.current) * CAM_BACK;
    const ty  = sampleTerrainHeight(tx, tz) + CAM_HEIGHT;
    const look = new THREE.Vector3(pos.x, pos.y + 0.15, pos.z);

    if (isFirst.current) {
      // Snap camera on first frame so there is no jarring swoop from overview
      state.camera.position.set(tx, ty, tz);
      camPosRef.current.set(tx, ty, tz);
      camLookRef.current.copy(look);
      isFirst.current = false;
    } else {
      camPosRef.current.lerp(new THREE.Vector3(tx, ty, tz), CAM_LERP);
      state.camera.position.copy(camPosRef.current);
      camLookRef.current.lerp(look, CAM_LERP);
    }
    state.camera.lookAt(camLookRef.current);
  });

  const startX = 2.20, startZ = 3.10;

  return (
    <group
      ref={groupRef}
      position={[startX, sampleTerrainHeight(startX, startZ), startZ]}
    >
      <primitive object={clone} scale={0.09} />

      <Html
        position={[0, 1.8, 0]}
        center
        distanceFactor={4}
        style={{ pointerEvents: "none" }}
      >
        <div style={{
          background: "rgba(28,34,140,0.90)",
          color: "#fff",
          borderRadius: 999,
          padding: "3px 11px",
          fontSize: 9,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 10px rgba(28,34,140,0.55)",
          border: "1.5px solid rgba(255,255,255,0.35)",
        }}>
          ★ {name}
        </div>
      </Html>
    </group>
  );
}
