"use client";
import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

// Wing bones to animate and their flap amplitudes
const WING_CONFIG = [
  { name: "wingsupper.l",     amp: 1.00 },
  { name: "wingsupper.l.001", amp: 1.00 },
  { name: "wingsupper.r",     amp: 1.00 },
  { name: "wingsupper.r.001", amp: 1.00 },
  { name: "wingdlower.l",     amp: 0.65 },
  { name: "wingdlower.l.001", amp: 0.65 },
  { name: "wingdlower.r",     amp: 0.65 },
  { name: "wingdlower.r.001", amp: 0.65 },
];

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const _q     = new THREE.Quaternion();

interface Props {
  position: [number, number, number];
  scale?: number;
  phaseOffset?: number;
}

export default function Butterfly({ position, scale = 0.12, phaseOffset = 0 }: Props) {
  const wrapRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/butterfly.glb");

  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Grab bone references + store rest quaternions once
  const wings = useMemo(() => {
    return WING_CONFIG
      .map(({ name, amp }) => {
        const bone = cloned.getObjectByName(name);
        return bone ? { bone, restQ: bone.quaternion.clone(), amp } : null;
      })
      .filter(Boolean) as { bone: THREE.Object3D; restQ: THREE.Quaternion; amp: number }[];
  }, [cloned]);

  useFrame(() => {
    if (!wrapRef.current) return;
    const t = performance.now() / 1000 + phaseOffset;

    // Direct bone rotation — local Z ≈ world Z for these bones (rest rot ~±91° around Z)
    // Both wings fold upward on the same sign, producing the open/close flap
    const flap = Math.sin(t * 10) * 0.95;
    wings.forEach(({ bone, restQ, amp }) => {
      _q.setFromAxisAngle(Z_AXIS, flap * amp);
      bone.quaternion.copy(restQ).multiply(_q);
    });

    // Lazy figure-8 flight path
    const x  = position[0] + Math.sin(t * 0.65) * 0.32;
    const z  = position[2] + Math.sin(t * 1.30) * 0.20;
    const y  = position[1] + 0.10 + Math.abs(Math.sin(t * 0.85)) * 0.16;
    const dx = Math.cos(t * 0.65) * 0.65 * 0.32;
    const dz = Math.cos(t * 1.30) * 1.30 * 0.20;
    if (Math.abs(dx) + Math.abs(dz) > 0.01) {
      wrapRef.current.rotation.y = Math.atan2(dx, dz);
    }
    wrapRef.current.position.set(x, y, z);
  });

  return (
    <group ref={wrapRef} position={position}>
      <primitive object={cloned} scale={scale} />
    </group>
  );
}

useGLTF.preload("/models/butterfly.glb");
