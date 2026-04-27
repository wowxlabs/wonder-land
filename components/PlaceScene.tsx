"use client";
import { Suspense } from "react";
import { Environment, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Place } from "@/data/places";
import { Avatar } from "@/data/avatars";
import { InfoPoint, useExperienceStore } from "@/store/useExperienceStore";
import AvatarController from "./AvatarController";
import NPCCharacter from "./NPCCharacter";
import InfoPointObject from "./InfoPointObject";

type V3 = [number, number, number];

// ─── Shared primitives ───────────────────────────────────────────────────────

function Tree({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0] as V3} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 6]} />
        <meshStandardMaterial color="#5c3317" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, 0] as V3} castShadow>
        <coneGeometry args={[0.7, 1.4, 8]} />
        <meshStandardMaterial color="#1a6e2a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 0] as V3} castShadow>
        <coneGeometry args={[0.5, 1.1, 8]} />
        <meshStandardMaterial color="#228b36" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PalmTree({ position, scale = 1 }: { position: V3; scale?: number }) {
  const fronds = [0, 1, 2, 3, 4, 5];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.2, 0] as V3} rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 2.4, 6]} />
        <meshStandardMaterial color="#8b6914" roughness={0.9} />
      </mesh>
      {fronds.map((i) => (
        <mesh
          key={i}
          position={[Math.sin((i * Math.PI * 2) / 6) * 0.3, 2.6, Math.cos((i * Math.PI * 2) / 6) * 0.3] as V3}
          rotation={[Math.PI / 6, (i * Math.PI * 2) / 6, 0]}
          castShadow
        >
          <coneGeometry args={[0.08, 1.0, 4]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Environments ────────────────────────────────────────────────────────────

const ROCK_RUINS: V3[] = [[-3, 0, -2], [3, 0, -3], [-2.5, 0, 1], [2.5, 0, 0]];
const ROCK_TREES: V3[] = [[-5, 0, 2], [5, 0, 2], [-4, 0, -1], [4.5, 0, -1]];

function RockEnvironment() {
  return (
    <group>
      <mesh position={[0, 1.5, -4] as V3} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2.2, 3.5, 12]} />
        <meshStandardMaterial color="#8b7355" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 3.4, -4] as V3}>
        <boxGeometry args={[2.8, 0.5, 2.8]} />
        <meshStandardMaterial color="#7a6545" roughness={0.8} />
      </mesh>
      {ROCK_RUINS.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.8, 0.5 + i * 0.2, 0.8]} />
          <meshStandardMaterial color="#9e8866" roughness={0.9} />
        </mesh>
      ))}
      {ROCK_TREES.map((p, i) => (
        <Tree key={i} position={p} scale={0.9} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, i * 0.2, -3.5 + i * 0.2] as V3} castShadow>
          <boxGeometry args={[1.2 - i * 0.15, 0.2, 0.3]} />
          <meshStandardMaterial color="#a89060" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

interface WallDef { pos: V3; size: V3 }
const FORT_WALLS: WallDef[] = [
  { pos: [0, 0.75, -5],  size: [10, 1.5, 0.6] },
  { pos: [0, 0.75, 5],   size: [10, 1.5, 0.6] },
  { pos: [-5, 0.75, 0],  size: [0.6, 1.5, 10] },
  { pos: [5, 0.75, 0],   size: [0.6, 1.5, 10] },
];
const FORT_TOWERS: V3[] = [[-5, 0, -5], [5, 0, -5], [-5, 0, 5], [5, 0, 5]];

function FortEnvironment() {
  return (
    <group>
      {FORT_WALLS.map((w, i) => (
        <mesh key={i} position={w.pos} castShadow receiveShadow>
          <boxGeometry args={w.size} />
          <meshStandardMaterial color="#d4b896" roughness={0.8} metalness={0.05} />
        </mesh>
      ))}
      {FORT_TOWERS.map((p, i) => (
        <mesh key={i} position={[p[0], 1.2, p[2]] as V3} castShadow>
          <cylinderGeometry args={[0.7, 0.8, 2.4, 8]} />
          <meshStandardMaterial color="#c4a882" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-3, 1.5, -3] as V3} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 3, 8]} />
        <meshStandardMaterial color="#f0e6d0" roughness={0.7} />
      </mesh>
      <mesh position={[-3, 3.3, -3] as V3}>
        <coneGeometry args={[0.45, 0.7, 8]} />
        <meshStandardMaterial color="#e05020" roughness={0.6} />
      </mesh>
      <mesh position={[3, 0.3, -4.2] as V3} rotation={[0, 0, Math.PI / 12]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.2, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.1, -12] as V3} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#0d3a6e" roughness={0.15} metalness={0.4} />
      </mesh>
    </group>
  );
}

const TEMPLE_PILLARS: V3[] = [[-1.4, 0, -2.5], [1.4, 0, -2.5], [-1.4, 0, -5.5], [1.4, 0, -5.5]];
const TEMPLE_TREES: V3[] = [[-5, 0, 0], [5, 0, 0], [-4, 0, -5], [4, 0, -5]];

function TempleEnvironment() {
  return (
    <group>
      <mesh position={[0, 0.5, -4] as V3} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color="#c8a870" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.8, -4] as V3} castShadow>
        <boxGeometry args={[3, 1.5, 3]} />
        <meshStandardMaterial color="#b89060" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3, -4] as V3} castShadow>
        <coneGeometry args={[1.4, 1.8, 8]} />
        <meshStandardMaterial color="#c8a028" roughness={0.6} metalness={0.1} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, i * 0.2, -2.0 - i * 0.1] as V3} castShadow>
          <boxGeometry args={[3 - i * 0.3, 0.2, 0.4]} />
          <meshStandardMaterial color="#b8a080" roughness={0.8} />
        </mesh>
      ))}
      {TEMPLE_PILLARS.map((p, i) => (
        <mesh key={i} position={[p[0], 1.2, p[2]] as V3} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 2.4, 8]} />
          <meshStandardMaterial color="#d4b888" roughness={0.75} />
        </mesh>
      ))}
      {TEMPLE_TREES.map((p, i) => (
        <Tree key={i} position={p} />
      ))}
      <mesh position={[0, 0.03, 4] as V3} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#1a4a7a" roughness={0.1} metalness={0.4} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function MountainEnvironment() {
  const teas = Array.from({ length: 16 }, (_, i) => i);
  return (
    <group>
      <mesh position={[0, 2, -6] as V3} castShadow>
        <coneGeometry args={[3, 5, 8]} />
        <meshStandardMaterial color="#2d5a1b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.6, -6] as V3}>
        <coneGeometry args={[1, 1.5, 8]} />
        <meshStandardMaterial color="#d0e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[-4, 1.5, -7] as V3} castShadow>
        <coneGeometry args={[2, 3.5, 8]} />
        <meshStandardMaterial color="#3a6e24" roughness={0.9} />
      </mesh>
      <mesh position={[4, 1.2, -6] as V3} castShadow>
        <coneGeometry args={[1.8, 2.8, 8]} />
        <meshStandardMaterial color="#2d5a1b" roughness={0.9} />
      </mesh>
      {teas.map((i) => {
        const x = (i % 4) * 1.5 - 2.5;
        const z = Math.floor(i / 4) * 1.5 - 1;
        return (
          <mesh key={i} position={[x, 0.2, z] as V3} castShadow>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshStandardMaterial color="#1b5e20" roughness={0.9} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.03, 2] as V3} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.5, -1] as V3}>
        <boxGeometry args={[3, 0.15, 0.8]} />
        <meshStandardMaterial color="#5c3d1a" roughness={0.85} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 0.9, 0.1, -1] as V3}>
          <torusGeometry args={[0.25, 0.05, 6, 8, Math.PI]} />
          <meshStandardMaterial color="#7a5230" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function JungleEnvironment() {
  const rockPos: V3[] = [[-2, 0, -2], [3, 0, 1], [-1, 0, 3], [2, 0, -3]];
  return (
    <group>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        const r = 5 + Math.sin(i) * 1.5;
        return (
          <Tree
            key={i}
            position={[Math.sin(angle) * r, 0, Math.cos(angle) * r] as V3}
            scale={0.8 + (i % 3) * 0.2}
          />
        );
      })}
      {rockPos.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <dodecahedronGeometry args={[0.5 + i * 0.1]} />
          <meshStandardMaterial color="#6b6b6b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-3, 0.04, -3] as V3} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial color="#1a5a2a" roughness={0.1} metalness={0.3} transparent opacity={0.8} />
      </mesh>
      <mesh position={[2, 0.5, -4] as V3} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#7a6550" roughness={0.9} />
      </mesh>
      <mesh position={[2, 1.5, -4] as V3}>
        <coneGeometry args={[0.9, 1.2, 8]} />
        <meshStandardMaterial color="#6a5540" roughness={0.9} />
      </mesh>
    </group>
  );
}

interface BuildingDef { pos: V3; size: V3 }
const CITY_BUILDINGS: BuildingDef[] = [
  { pos: [3, 1.5, -3],  size: [1.5, 3, 1.5] },
  { pos: [-3, 2.5, -4], size: [1.8, 5, 1.8] },
  { pos: [5, 1, -2],    size: [1.2, 2, 1.2] },
  { pos: [-5, 1.8, -2], size: [1.4, 3.6, 1.4] },
  { pos: [0, 3, -6],    size: [2, 6, 2] },
];
const CITY_LIGHTS: V3[] = [[-2, 0, -1], [2, 0, -1], [-2, 0, 3], [2, 0, 3]];
const CITY_PALMS: V3[] = [[-4, 0, 0], [4, 0, 0]];
const ROAD_MARKS = [-2, 0, 2, 4];

function CityEnvironment() {
  return (
    <group>
      {CITY_BUILDINGS.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#1a2a3a" : "#2a3a4a"}
            roughness={0.3}
            metalness={0.4}
            emissive={i % 3 === 0 ? "#0a1520" : "#000"}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 2] as V3} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>
      {ROAD_MARKS.map((z, i) => (
        <mesh key={i} position={[0, 0.03, z] as V3} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.6]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
        </mesh>
      ))}
      {CITY_LIGHTS.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 1.2, 0] as V3}>
            <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
            <meshStandardMaterial color="#555" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.4, 0] as V3}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#fff8c0" emissive="#fff8c0" emissiveIntensity={2} />
          </mesh>
          <pointLight position={[0, 2.4, 0] as V3} intensity={1} distance={4} color="#fff8c0" />
        </group>
      ))}
      {CITY_PALMS.map((p, i) => (
        <PalmTree key={i} position={p} />
      ))}
    </group>
  );
}

const RUINS_COLUMNS: V3[] = [[-3, 0, -2], [3, 0, -2], [-3, 0, -6], [3, 0, -6], [-2, 0, 1], [2, 0, 1]];
const RUINS_RUBBLE: V3[] = [[-4, 0, 2], [4, 0, 1], [-2, 0, -2], [3, 0, -3]];

function RuinsEnvironment() {
  return (
    <group>
      <mesh position={[0, 0.7, -4] as V3} castShadow receiveShadow>
        <sphereGeometry args={[1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, -4] as V3}>
        <cylinderGeometry args={[0.2, 0.4, 0.8, 8]} />
        <meshStandardMaterial color="#c8b890" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, -4] as V3} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 16]} />
        <meshStandardMaterial color="#bba870" roughness={0.9} />
      </mesh>
      {RUINS_COLUMNS.map((p, i) => (
        <mesh key={i} position={[p[0], 1 + (i % 2) * 0.4, p[2]] as V3} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 2 + (i % 2) * 0.8, 8]} />
          <meshStandardMaterial color="#c8b888" roughness={0.85} />
        </mesh>
      ))}
      {RUINS_RUBBLE.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.5 + i * 0.2, 0.3, 0.5 + i * 0.1]} />
          <meshStandardMaterial color="#b8a878" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[3, 0.8, -3] as V3} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.8, 8]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} />
      </mesh>
      <mesh position={[3, 2.4, -3] as V3} castShadow>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshStandardMaterial color="#1a5e20" roughness={0.85} />
      </mesh>
    </group>
  );
}

function ParkEnvironment() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        return (
          <Tree
            key={i}
            position={[Math.sin(angle) * 4.5, 0, Math.cos(angle) * 4.5] as V3}
            scale={0.7 + (i % 3) * 0.2}
          />
        );
      })}
      <mesh position={[2, 0.04, 2] as V3} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial color="#1a4a6a" roughness={0.1} metalness={0.3} transparent opacity={0.8} />
      </mesh>
      {(([[1.2, 0.2, 3], [2.8, 0.15, 1.2], [3, 0.2, 2.8]] as V3[])).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <dodecahedronGeometry args={[0.25 + i * 0.1]} />
          <meshStandardMaterial color="#7a6a5a" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[(Math.random() - 0.5) * 8, 0.15, (Math.random() - 0.5) * 8] as V3}
        >
          <coneGeometry args={[0.06, 0.35, 4]} />
          <meshStandardMaterial color="#8b7a3a" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function GroundPlane({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[30, 30, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

const ENV_GROUND: Record<string, string> = {
  rock: "#2a3a1a",
  fort: "#c8b896",
  temple: "#3a2a1a",
  mountain: "#2a3a2a",
  jungle: "#1a3a1a",
  city: "#1a1e2a",
  ruins: "#3a3220",
  park: "#2a3a18",
};

type EnvPreset = "dawn" | "sunset" | "night" | "warehouse" | "forest" | "apartment" | "studio" | "city" | "park" | "lobby";

const ENV_SKY: Record<string, EnvPreset> = {
  rock: "sunset",
  fort: "dawn",
  temple: "sunset",
  mountain: "forest",
  jungle: "forest",
  city: "city",
  ruins: "dawn",
  park: "park",
};

interface Props {
  place: Place;
  avatar: Avatar;
}

export default function PlaceScene({ place, avatar }: Props) {
  const { setActiveInfoPoint, setShowInfoPanel } = useExperienceStore();

  function handleInteract(point: InfoPoint) {
    setActiveInfoPoint(point);
    setShowInfoPanel(true);
  }

  const npcs = place.infoPoints.filter((p) => p.type === "npc");
  const infos = place.infoPoints.filter((p) => p.type !== "npc");
  const groundColor = ENV_GROUND[place.environment] ?? "#2a3a1a";
  const skyPreset = ENV_SKY[place.environment] ?? "sunset";
  const bounds = { minX: -8, maxX: 8, minZ: -7, maxZ: 7 };

  return (
    <>
      <color attach="background" args={["#080c14"]} />
      <fog attach="fog" args={["#080c14", 18, 35]} />

      <ambientLight intensity={0.6} color="#c0d8f0" />
      <directionalLight
        position={[8, 15, 5] as V3}
        intensity={1.8}
        color="#fff8e7"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[0, 6, 0] as V3} intensity={0.4} color={place.color} />

      <Suspense fallback={null}>
        <Environment preset={skyPreset} />
        <Stars radius={40} depth={40} count={1500} factor={3} fade speed={0.3} />

        <GroundPlane color={groundColor} />

        {place.environment === "rock" && <RockEnvironment />}
        {place.environment === "fort" && <FortEnvironment />}
        {place.environment === "temple" && <TempleEnvironment />}
        {place.environment === "mountain" && <MountainEnvironment />}
        {place.environment === "jungle" && <JungleEnvironment />}
        {place.environment === "city" && <CityEnvironment />}
        {place.environment === "ruins" && <RuinsEnvironment />}
        {place.environment === "park" && <ParkEnvironment />}

        {npcs.map((npc) => (
          <NPCCharacter
            key={npc.id}
            infoPoint={npc}
            onInteract={handleInteract}
            avatarNear={false}
          />
        ))}

        {infos.map((ip) => (
          <InfoPointObject
            key={ip.id}
            infoPoint={ip}
            onInteract={handleInteract}
            avatarNear={false}
          />
        ))}

        <AvatarController
          avatar={avatar}
          infoPoints={place.infoPoints}
          bounds={bounds}
        />
      </Suspense>
    </>
  );
}
