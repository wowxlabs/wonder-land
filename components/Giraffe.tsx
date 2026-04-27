"use client";
import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { idlePreload } from "@/lib/preload";
import { useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

const NECK_BONES = [
  "DEF-spine.005",
  "DEF-spine.006",
  "DEF-spine.007",
  "DEF-spine.008",
  "DEF-spine.009",
  "DEF-spine.010",
  "DEF-spine.011",
];

// Each bone contributes a fraction of the total neck bend
const BONE_WEIGHT = [0.08, 0.12, 0.14, 0.16, 0.18, 0.18, 0.14];

interface Props {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
  phaseOffset?: number;
}

export default function Giraffe({
  position,
  scale = 0.55,
  rotation = 0,
  phaseOffset = 0,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/girafe.glb");

  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixer  = useMemo(() => new THREE.AnimationMixer(cloned), [cloned]);

  // Grab neck bones once after clone is ready
  const neckBones = useMemo(() => {
    const map = new Map<string, THREE.Bone>();
    cloned.traverse((obj) => {
      if ((obj as THREE.Bone).isBone && NECK_BONES.includes(obj.name)) {
        map.set(obj.name, obj as THREE.Bone);
      }
    });
    return NECK_BONES.map((n) => map.get(n)).filter(Boolean) as THREE.Bone[];
  }, [cloned]);

  // Store rest rotations so we can offset them cleanly
  const restQ = useMemo(
    () => neckBones.map((b) => b.quaternion.clone()),
    [neckBones]
  );

  useEffect(() => {
    const clip = THREE.AnimationClip.findByName(animations, "iddle");
    if (clip) mixer.clipAction(clip).play();
    return () => { mixer.stopAllAction(); };
  }, [mixer, animations]);

  useFrame((_, delta) => {
    mixer.update(delta);

    const t = performance.now() / 1000 + phaseOffset;
    // Slow eat-lift cycle: 5 s down eating, 1.5 s raising head
    const cycle = (t % 6.5) / 6.5;
    const eatT  = Math.min(cycle / 0.77, 1);    // 0→1 going down
    const liftT = Math.max((cycle - 0.77) / 0.23, 0); // 0→1 raising
    const bend  = eatT < 1 ? eatT : 1 - liftT; // triangle wave staying low

    const chew  = Math.sin(t * 4.0) * 0.04 * Math.max(0, bend - 0.4); // chewing bob

    neckBones.forEach((bone, i) => {
      const weight = BONE_WEIGHT[i] ?? 0.1;
      const angle  = bend * 1.8 * weight + chew * weight;
      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        angle
      );
      bone.quaternion.copy(restQ[i]).multiply(q);
    });
  });

  return (
    <primitive
      ref={group}
      object={cloned}
      position={position}
      scale={scale}
      rotation={[0, rotation, 0]}
    />
  );
}

idlePreload(["/models/girafe.glb"]);
