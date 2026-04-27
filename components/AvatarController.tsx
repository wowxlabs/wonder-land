"use client";
import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Avatar } from "@/data/avatars";
import { InfoPoint, useExperienceStore } from "@/store/useExperienceStore";

interface Props {
  avatar: Avatar;
  infoPoints: InfoPoint[];
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
}

const WALK_SPEED = 3.5;
const PROXIMITY_DIST = 2.2;
const CAMERA_DISTANCE = 5;
const CAMERA_HEIGHT = 3;

export default function AvatarController({ avatar, infoPoints, bounds }: Props) {
  const avatarRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
  const isMoving = useRef(false);
  const facingAngle = useRef(0);
  const { camera } = useThree();
  const { setActiveInfoPoint, setShowInfoPanel } = useExperienceStore();
  const [nearPoint, setNearPoint] = useState<InfoPoint | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key in keys.current) {
        (keys.current as Record<string, boolean>)[e.key] = true;
        e.preventDefault();
      }
      if (e.key === "e" || e.key === "E") {
        if (nearPoint) {
          setActiveInfoPoint(nearPoint);
          setShowInfoPanel(true);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key in keys.current) (keys.current as Record<string, boolean>)[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [nearPoint, setActiveInfoPoint, setShowInfoPanel]);

  useFrame(({ clock }, delta) => {
    if (!avatarRef.current) return;
    const t = clock.getElapsedTime();

    const fwd = (keys.current.w || keys.current.ArrowUp);
    const back = (keys.current.s || keys.current.ArrowDown);
    const left = (keys.current.a || keys.current.ArrowLeft);
    const right = (keys.current.d || keys.current.ArrowRight);
    isMoving.current = fwd || back || left || right;

    if (isMoving.current) {
      let moveX = 0, moveZ = 0;
      if (fwd) moveZ -= 1;
      if (back) moveZ += 1;
      if (left) moveX -= 1;
      if (right) moveX += 1;

      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      if (len > 0) { moveX /= len; moveZ /= len; }

      if (len > 0) facingAngle.current = Math.atan2(moveX, moveZ);

      const newX = avatarRef.current.position.x + moveX * WALK_SPEED * delta;
      const newZ = avatarRef.current.position.z + moveZ * WALK_SPEED * delta;

      if (bounds) {
        avatarRef.current.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
        avatarRef.current.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
      } else {
        avatarRef.current.position.x = newX;
        avatarRef.current.position.z = newZ;
      }
    }

    avatarRef.current.rotation.y = THREE.MathUtils.lerp(avatarRef.current.rotation.y, facingAngle.current, 0.15);

    // Walk animation
    if (isMoving.current) {
      const swing = Math.sin(t * 8) * 0.4;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.6;
      if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.04;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.8;
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.8;
      // Idle bob
      if (bodyRef.current) bodyRef.current.position.y = Math.sin(t * 1.5) * 0.02;
    }

    // Camera follow
    const avatarPos = avatarRef.current.position;
    const targetCamPos = new THREE.Vector3(
      avatarPos.x + Math.sin(facingAngle.current) * CAMERA_DISTANCE * -1,
      CAMERA_HEIGHT,
      avatarPos.z + Math.cos(facingAngle.current) * CAMERA_DISTANCE * -1,
    );
    camera.position.lerp(targetCamPos, 0.06);
    const lookTarget = new THREE.Vector3(avatarPos.x, 1.2, avatarPos.z);
    camera.lookAt(lookTarget);

    // Proximity check
    let closest: InfoPoint | null = null;
    let minDist = PROXIMITY_DIST;
    for (const ip of infoPoints) {
      const dx = avatarPos.x - ip.position[0];
      const dz = avatarPos.z - ip.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) { minDist = dist; closest = ip; }
    }
    setNearPoint(closest);
  });

  return (
    <group ref={avatarRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.55, 8, 16]} />
        <meshStandardMaterial color={avatar.primaryColor} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={avatar.skinColor} roughness={0.6} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 1.65, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.08, 1.65, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Torso stripe */}
      <mesh position={[0, 0.9, 0.24]}>
        <boxGeometry args={[0.3, 0.1, 0.04]} />
        <meshStandardMaterial color={avatar.secondaryColor} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.38, 0.88, 0]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color={avatar.primaryColor} roughness={0.4} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.38, 0.88, 0]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color={avatar.primaryColor} roughness={0.4} />
      </mesh>

      {/* Girl: skirt */}
      {avatar.gender === "girl" && (
        <mesh position={[0, 0.45, 0]}>
          <coneGeometry args={[0.42, 0.55, 12, 1, true]} />
          <meshStandardMaterial color={avatar.secondaryColor} roughness={0.6} side={2} />
        </mesh>
      )}

      {/* Legs (boy only) */}
      {avatar.gender === "boy" && (
        <>
          <mesh ref={leftLegRef} position={[-0.14, 0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
            <meshStandardMaterial color={avatar.secondaryColor} roughness={0.5} />
          </mesh>
          <mesh ref={rightLegRef} position={[0.14, 0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
            <meshStandardMaterial color={avatar.secondaryColor} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Feet */}
      <mesh position={[-0.14, avatar.gender === "girl" ? 0.1 : -0.02, 0.07]}>
        <boxGeometry args={[0.16, 0.07, 0.24]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
      </mesh>
      <mesh position={[0.14, avatar.gender === "girl" ? 0.1 : -0.02, 0.07]}>
        <boxGeometry args={[0.16, 0.07, 0.24]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
      </mesh>

      {/* Boy: hat */}
      {avatar.accessory === "hat" && (
        <>
          <mesh position={[0, 1.88, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.22, 12]} />
            <meshStandardMaterial color={avatar.accentColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.78, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.05, 12]} />
            <meshStandardMaterial color={avatar.accentColor} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Girl: headband */}
      {avatar.accessory === "headband" && (
        <mesh position={[0, 1.7, 0]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.21, 0.03, 6, 16]} />
          <meshStandardMaterial color={avatar.accentColor} roughness={0.6} />
        </mesh>
      )}

      {/* Shadow blob */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#000" transparent opacity={0.3} />
      </mesh>

      {/* Near-point prompt */}
      {nearPoint && (
        <mesh position={[0, 2.4, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}
