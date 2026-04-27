"use client";
import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import PlaceMarker from "./PlaceMarker";
import CameraController from "./CameraController";
import SriLankaIsland from "./SriLankaIsland";
import MapVegetation from "./MapVegetation";
import OceanPlane from "./OceanPlane";
import FlockingBirds from "./FlockingBirds";
import Butterfly from "./Butterfly";
import MapPerson from "./MapPerson";
import Planter from "./Planter";
import GrassPatch from "./GrassPatch";
import MapFarmBuilding from "./MapFarmBuilding";
import MapWindmill from "./MapWindmill";
import LandingPad from "./LandingPad";
import PlayerAvatar from "./PlayerAvatar";
import YalaShoreDecoration from "./YalaShoreDecoration";
import { PLACES, Place } from "@/data/places";
import { ISLAND_POLY } from "@/lib/terrain";
import { useExperienceStore } from "@/store/useExperienceStore";

const COAST_CENTER: [number, number] = [-0.4, 0.0];
const COASTAL_PATH: [number, number][] = ISLAND_POLY.slice(0, -1).map(([x, z]) => {
  const dx = COAST_CENTER[0] - x;
  const dz = COAST_CENTER[1] - z;
  const len = Math.hypot(dx, dz) || 1;
  return [x + (dx / len) * 0.50, z + (dz / len) * 0.50];
});



interface Props {
  onPlaceSelect: (place: Place) => void;
  onReady?: () => void;
  active?: boolean;
  rotationEnabled?: boolean;
  onAvatarPadClick?: () => void;
}

function MapReadySignal({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CameraKeyControl({ orbitRef, onStart, onEnd }: { orbitRef: React.RefObject<any>; onStart: () => void; onEnd: () => void }) {
  const keys = useRef({ left: false, right: false, up: false, down: false });
  const active = useRef(false);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      if (e.key === "ArrowLeft")  keys.current.left  = true;
      if (e.key === "ArrowRight") keys.current.right = true;
      if (e.key === "ArrowUp")    keys.current.up    = true;
      if (e.key === "ArrowDown")  keys.current.down  = true;
      if (!active.current) { active.current = true; onStart(); }
    }
    function up(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  keys.current.left  = false;
      if (e.key === "ArrowRight") keys.current.right = false;
      if (e.key === "ArrowUp")    keys.current.up    = false;
      if (e.key === "ArrowDown")  keys.current.down  = false;
      if (!Object.values(keys.current).some(Boolean)) { active.current = false; onEnd(); }
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [onStart, onEnd]);

  useFrame((_, delta) => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    const { left, right, up, down } = keys.current;
    if (!left && !right && !up && !down) return;
    const AZ = 1.4 * delta;
    const PO = 0.8 * delta;
    if (left)  orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() - AZ);
    if (right) orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + AZ);
    if (up)    orbit.setPolarAngle(Math.max(orbit.minPolarAngle ?? 0.15,          orbit.getPolarAngle() - PO));
    if (down)  orbit.setPolarAngle(Math.min(orbit.maxPolarAngle ?? Math.PI / 2.1, orbit.getPolarAngle() + PO));
    orbit.update();
  });

  return null;
}

export default function SriLankaMap({ onPlaceSelect, onReady, active = true, rotationEnabled = true, onAvatarPadClick }: Props) {
  const { selectedPlace, selectedAvatar } = useExperienceStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef       = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const resumeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  useThree(); // keep camera context

  function handleOrbitStart() {
    if (resumeTimer.current) { clearTimeout(resumeTimer.current); resumeTimer.current = null; }
    setAutoRotate(false);
  }

  function handleOrbitEnd() {
    resumeTimer.current = setTimeout(() => {
      setAutoRotate(true);
      resumeTimer.current = null;
    }, 2000);
  }

  // ── Camera positions ────────────────────────────────────────────────────
  const overviewPos    = useMemo(() => new THREE.Vector3(0, 8, 5), []);
  const overviewTarget = useMemo(() => new THREE.Vector3(0, 0.5, -1.5), []);

  const selectedPos = useMemo(() => {
    if (!selectedPlace) return overviewPos;
    const [px, py, pz] = selectedPlace.position;
    const [ox, oy, oz] = selectedPlace.cameraOffset;
    return new THREE.Vector3(px + ox * 0.5, py + oy * 1.2, pz + oz * 0.5);
  }, [selectedPlace, overviewPos]);

  const selectedTarget = useMemo(() => {
    if (!selectedPlace) return overviewTarget;
    const [px, py, pz] = selectedPlace.position;
    return new THREE.Vector3(px, py, pz);
  }, [selectedPlace, overviewTarget]);

  const camPos    = selectedPlace ? selectedPos    : overviewPos;
  const camTarget = selectedPlace ? selectedTarget : overviewTarget;

  return (
    <>
      {/* Sky + fog — only applied when map is active so PlaceScene can set its own */}
      {active && <color attach="background" args={["#87ceeb"]} />}
      {active && <fog attach="fog" args={["#b8e4f8", 38, 85]} />}

      {/* All geometry + lighting in a group — visible=false keeps assets in GPU
          memory while completely removing them from the render pass */}
      <group visible={active}>
        <ambientLight intensity={1.2} color="#e8f4ff" />
        <directionalLight
          position={[-5, 28, 2]}
          intensity={1.4}
          color="#fff8e0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={70}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[4, 10, 14]} intensity={0.6} color="#d8f0ff" />

        <Suspense fallback={null}>
          <OceanPlane />
          <SriLankaIsland />
          <MapVegetation />
          <YalaShoreDecoration />
          <FlockingBirds />
<Butterfly position={[-1.95, 0.18, 2.75]} phaseOffset={0}   />
          <Butterfly position={[-2.15, 0.18, 1.15]} phaseOffset={1.7} />
          <Butterfly position={[ 1.65, 0.18,-0.45]} phaseOffset={3.1} />
          <Butterfly position={[-0.82, 0.18,-5.15]} phaseOffset={5.0} />

          <MapPerson modelPath="/models/people/peasant_1_walk.fbx" scale={0.09} patrolPath={COASTAL_PATH} />
          {selectedAvatar?.id === "boy" && (
            <PlayerAvatar name={selectedAvatar.name} onPlaceSelect={onPlaceSelect} />
          )}

          {/* South beach — smoker and arguer face to face */}
          <MapPerson modelPath="/models/people/Smoking.fbx"  scale={0.09} position={[ 1.65, 0, 3.75]} rotationY={ Math.PI * 0.5} />
          <MapPerson modelPath="/models/people/arguing.fbx"  scale={0.09} position={[ 1.80, 0, 3.75]} rotationY={-Math.PI * 0.5} yOffset={0.04} />
          <LandingPad position={[2.27, 0, 3.13]} onPress={() => onAvatarPadClick?.()} />

          {/* Dense carpet base — full farm area */}
          <GrassPatch cx={2.47} cz={1.85} radius={0.45} count={150} seed={600} scale={0.022} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={1.85} radius={0.45} count={150} seed={601} scale={0.016} clipToIsland={false} alt />
          <GrassPatch cx={2.20} cz={1.40} radius={0.30} count={100} seed={602} scale={0.022} clipToIsland={false} />
          <GrassPatch cx={2.75} cz={1.40} radius={0.30} count={100} seed={603} scale={0.016} clipToIsland={false} alt />
          <GrassPatch cx={2.20} cz={2.30} radius={0.30} count={100} seed={604} scale={0.022} clipToIsland={false} />
          <GrassPatch cx={2.75} cz={2.30} radius={0.30} count={100} seed={605} scale={0.016} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.15} radius={0.28} count={80}  seed={606} scale={0.020} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={2.58} radius={0.28} count={80}  seed={607} scale={0.016} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.85} radius={0.45} count={200} seed={608} scale={0.020} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={1.85} radius={0.45} count={200} seed={609} scale={0.014} clipToIsland={false} alt />
          <GrassPatch cx={2.20} cz={1.85} radius={0.40} count={150} seed={610} scale={0.020} clipToIsland={false} />
          <GrassPatch cx={2.75} cz={1.85} radius={0.40} count={150} seed={611} scale={0.014} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.45} radius={0.38} count={150} seed={612} scale={0.020} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={2.25} radius={0.38} count={150} seed={613} scale={0.014} clipToIsland={false} alt />
          <GrassPatch cx={2.25} cz={1.60} radius={0.35} count={120} seed={614} scale={0.018} clipToIsland={false} />
          <GrassPatch cx={2.70} cz={1.60} radius={0.35} count={120} seed={615} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.25} cz={2.10} radius={0.35} count={120} seed={616} scale={0.018} clipToIsland={false} />
          <GrassPatch cx={2.70} cz={2.10} radius={0.35} count={120} seed={617} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.85} radius={0.55} count={180} seed={618} scale={0.016} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={1.85} radius={0.55} count={180} seed={619} scale={0.012} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.85} radius={0.60} count={250} seed={620} scale={0.018} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={1.85} radius={0.60} count={250} seed={621} scale={0.013} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.85} radius={0.60} count={250} seed={622} scale={0.015} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={1.85} radius={0.60} count={250} seed={623} scale={0.011} clipToIsland={false} alt />
          <GrassPatch cx={2.30} cz={1.30} radius={0.30} count={150} seed={624} scale={0.016} clipToIsland={false} />
          <GrassPatch cx={2.65} cz={1.30} radius={0.30} count={150} seed={625} scale={0.016} clipToIsland={false} alt />
          <GrassPatch cx={2.30} cz={2.45} radius={0.30} count={150} seed={626} scale={0.016} clipToIsland={false} />
          <GrassPatch cx={2.65} cz={2.45} radius={0.30} count={150} seed={627} scale={0.016} clipToIsland={false} alt />
          <GrassPatch cx={2.15} cz={1.65} radius={0.28} count={120} seed={628} scale={0.014} clipToIsland={false} />
          <GrassPatch cx={2.80} cz={1.65} radius={0.28} count={120} seed={629} scale={0.014} clipToIsland={false} alt />
          <GrassPatch cx={2.15} cz={2.05} radius={0.28} count={120} seed={630} scale={0.014} clipToIsland={false} />
          <GrassPatch cx={2.80} cz={2.05} radius={0.28} count={120} seed={631} scale={0.014} clipToIsland={false} alt />

          {/* Grass inside fence — clipToIsland disabled so terrain clipping doesn't eat them */}
          <GrassPatch cx={2.47} cz={1.85} radius={0.35} count={30} seed={500} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={1.85} radius={0.35} count={50} seed={501} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.20} cz={1.35} radius={0.25} count={30} seed={502} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.70} cz={1.35} radius={0.25} count={50} seed={503} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.20} cz={2.35} radius={0.25} count={30} seed={504} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.70} cz={2.35} radius={0.25} count={50} seed={505} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.20} radius={0.25} count={30} seed={506} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={2.55} radius={0.25} count={50} seed={507} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.15} cz={1.85} radius={0.20} count={30} seed={508} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.78} cz={1.85} radius={0.20} count={50} seed={509} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.35} cz={1.55} radius={0.22} count={30} seed={510} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.35} cz={1.55} radius={0.22} count={50} seed={511} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.65} cz={1.55} radius={0.22} count={30} seed={512} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.65} cz={1.55} radius={0.22} count={50} seed={513} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.35} cz={2.15} radius={0.22} count={30} seed={514} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.35} cz={2.15} radius={0.22} count={50} seed={515} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.65} cz={2.15} radius={0.22} count={30} seed={516} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.65} cz={2.15} radius={0.22} count={50} seed={517} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={1.50} radius={0.22} count={30} seed={518} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={1.50} radius={0.22} count={50} seed={519} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.47} cz={2.20} radius={0.22} count={30} seed={520} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.47} cz={2.20} radius={0.22} count={50} seed={521} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.20} cz={1.85} radius={0.22} count={30} seed={522} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.20} cz={1.85} radius={0.22} count={50} seed={523} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.75} cz={2.50} radius={0.20} count={30} seed={524} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.75} cz={2.50} radius={0.20} count={50} seed={525} scale={0.018} clipToIsland={false} alt />
          <GrassPatch cx={2.20} cz={1.15} radius={0.18} count={30} seed={526} scale={0.028} clipToIsland={false} />
          <GrassPatch cx={2.20} cz={1.15} radius={0.18} count={50} seed={527} scale={0.018} clipToIsland={false} alt />

          {/* Farm grass carpet — dense base layers */}
          <GrassPatch cx={2.55} cz={1.85} radius={0.70} count={120} seed={300} scale={0.028} />
          <GrassPatch cx={2.55} cz={1.85} radius={0.70} count={120} seed={301} scale={0.028} alt />
          <GrassPatch cx={2.20} cz={1.50} radius={0.45} count={80}  seed={302} scale={0.026} />
          <GrassPatch cx={2.90} cz={1.50} radius={0.45} count={80}  seed={303} scale={0.026} alt />
          <GrassPatch cx={2.20} cz={2.20} radius={0.45} count={80}  seed={304} scale={0.026} />
          <GrassPatch cx={2.90} cz={2.20} radius={0.45} count={80}  seed={305} scale={0.026} alt />
          <GrassPatch cx={2.55} cz={1.15} radius={0.40} count={70}  seed={306} scale={0.025} />
          <GrassPatch cx={2.55} cz={2.55} radius={0.40} count={70}  seed={307} scale={0.025} alt />

          {/* Farm ground grass fill */}
          <GrassPatch cx={2.30} cz={1.30} radius={0.18} count={14} seed={11} />
          <GrassPatch cx={2.60} cz={1.20} radius={0.18} count={14} seed={22} />
          <GrassPatch cx={2.90} cz={1.35} radius={0.18} count={14} seed={33} />
          <GrassPatch cx={2.20} cz={1.60} radius={0.18} count={14} seed={44} />
          <GrassPatch cx={2.55} cz={1.50} radius={0.18} count={14} seed={55} />
          <GrassPatch cx={2.85} cz={1.65} radius={0.18} count={14} seed={66} />
          <GrassPatch cx={2.20} cz={1.95} radius={0.18} count={14} seed={77} />
          <GrassPatch cx={2.55} cz={1.90} radius={0.18} count={14} seed={88} />
          <GrassPatch cx={2.88} cz={2.00} radius={0.18} count={14} seed={99} />
          <GrassPatch cx={2.25} cz={2.30} radius={0.18} count={14} seed={12} />
          <GrassPatch cx={2.60} cz={2.25} radius={0.18} count={14} seed={23} />
          <GrassPatch cx={2.88} cz={2.35} radius={0.18} count={14} seed={34} />
          <GrassPatch cx={2.40} cz={2.55} radius={0.18} count={14} seed={45} />
          <GrassPatch cx={2.70} cz={2.55} radius={0.18} count={14} seed={56} />
          <GrassPatch cx={2.15} cz={1.15} radius={0.12} count={12} seed={67} />
          <GrassPatch cx={2.45} cz={1.10} radius={0.12} count={12} seed={78} />
          <GrassPatch cx={2.75} cz={1.10} radius={0.12} count={12} seed={89} />
          <GrassPatch cx={2.15} cz={1.45} radius={0.12} count={12} seed={91} />
          <GrassPatch cx={2.45} cz={1.40} radius={0.12} count={12} seed={14} />
          <GrassPatch cx={2.75} cz={1.45} radius={0.12} count={12} seed={25} />
          <GrassPatch cx={2.15} cz={1.75} radius={0.12} count={12} seed={36} />
          <GrassPatch cx={2.45} cz={1.75} radius={0.12} count={12} seed={47} />
          <GrassPatch cx={2.75} cz={1.80} radius={0.12} count={12} seed={58} />
          <GrassPatch cx={2.15} cz={2.10} radius={0.12} count={12} seed={69} />
          <GrassPatch cx={2.45} cz={2.10} radius={0.12} count={12} seed={71} />
          <GrassPatch cx={2.75} cz={2.15} radius={0.12} count={12} seed={82} />
          <GrassPatch cx={2.15} cz={2.45} radius={0.12} count={12} seed={93} />
          <GrassPatch cx={2.45} cz={2.45} radius={0.12} count={12} seed={15} />
          <GrassPatch cx={2.75} cz={2.45} radius={0.12} count={12} seed={26} />
          <GrassPatch cx={2.25} cz={1.25} radius={0.08} count={10} seed={101} />
          <GrassPatch cx={2.50} cz={1.25} radius={0.08} count={10} seed={102} />
          <GrassPatch cx={2.75} cz={1.25} radius={0.08} count={10} seed={103} />
          <GrassPatch cx={2.25} cz={1.55} radius={0.08} count={10} seed={104} />
          <GrassPatch cx={2.50} cz={1.55} radius={0.08} count={10} seed={105} />
          <GrassPatch cx={2.75} cz={1.55} radius={0.08} count={10} seed={106} />
          <GrassPatch cx={2.25} cz={1.85} radius={0.08} count={10} seed={107} />
          <GrassPatch cx={2.50} cz={1.85} radius={0.08} count={10} seed={108} />
          <GrassPatch cx={2.75} cz={1.85} radius={0.08} count={10} seed={109} />
          <GrassPatch cx={2.25} cz={2.15} radius={0.08} count={10} seed={110} />
          <GrassPatch cx={2.50} cz={2.15} radius={0.08} count={10} seed={111} />
          <GrassPatch cx={2.75} cz={2.15} radius={0.08} count={10} seed={112} />
          <GrassPatch cx={2.25} cz={2.45} radius={0.08} count={10} seed={113} />
          <GrassPatch cx={2.50} cz={2.45} radius={0.08} count={10} seed={114} />
          <GrassPatch cx={2.75} cz={2.45} radius={0.08} count={10} seed={115} />
          <GrassPatch cx={2.95} cz={1.35} radius={0.06} count={8}  seed={116} />
          <GrassPatch cx={2.95} cz={1.65} radius={0.06} count={8}  seed={117} />
          <GrassPatch cx={2.95} cz={1.95} radius={0.06} count={8}  seed={118} />
          <GrassPatch cx={2.95} cz={2.25} radius={0.06} count={8}  seed={119} />
          <GrassPatch cx={2.15} cz={1.35} radius={0.06} count={8}  seed={120} />
          <GrassPatch cx={2.15} cz={1.65} radius={0.06} count={8}  seed={121} />
          <GrassPatch cx={2.15} cz={1.95} radius={0.06} count={8}  seed={122} />
          <GrassPatch cx={2.15} cz={2.25} radius={0.06} count={8}  seed={123} />
          <GrassPatch cx={2.35} cz={1.15} radius={0.10} count={16} seed={124} />
          <GrassPatch cx={2.65} cz={1.15} radius={0.10} count={16} seed={125} />
          <GrassPatch cx={2.35} cz={1.40} radius={0.10} count={16} seed={126} />
          <GrassPatch cx={2.65} cz={1.40} radius={0.10} count={16} seed={127} />
          <GrassPatch cx={2.35} cz={1.65} radius={0.10} count={16} seed={128} />
          <GrassPatch cx={2.65} cz={1.65} radius={0.10} count={16} seed={129} />
          <GrassPatch cx={2.35} cz={1.90} radius={0.10} count={16} seed={130} />
          <GrassPatch cx={2.65} cz={1.90} radius={0.10} count={16} seed={131} />
          <GrassPatch cx={2.35} cz={2.15} radius={0.10} count={16} seed={132} />
          <GrassPatch cx={2.65} cz={2.15} radius={0.10} count={16} seed={133} />
          <GrassPatch cx={2.35} cz={2.40} radius={0.10} count={16} seed={134} />
          <GrassPatch cx={2.65} cz={2.40} radius={0.10} count={16} seed={135} />
          <GrassPatch cx={2.50} cz={1.30} radius={0.10} count={16} seed={136} />
          <GrassPatch cx={2.50} cz={1.55} radius={0.10} count={16} seed={137} />
          <GrassPatch cx={2.50} cz={1.80} radius={0.10} count={16} seed={138} />
          <GrassPatch cx={2.50} cz={2.05} radius={0.10} count={16} seed={139} />
          <GrassPatch cx={2.50} cz={2.30} radius={0.10} count={16} seed={140} />
          <GrassPatch cx={2.50} cz={2.55} radius={0.10} count={16} seed={141} />
          <GrassPatch cx={2.30} cz={1.20} radius={0.15} count={14} seed={201} alt />
          <GrassPatch cx={2.70} cz={1.30} radius={0.15} count={14} seed={202} alt />
          <GrassPatch cx={2.20} cz={1.55} radius={0.15} count={14} seed={203} alt />
          <GrassPatch cx={2.60} cz={1.60} radius={0.15} count={14} seed={204} alt />
          <GrassPatch cx={2.90} cz={1.50} radius={0.15} count={14} seed={205} alt />
          <GrassPatch cx={2.30} cz={1.90} radius={0.15} count={14} seed={206} alt />
          <GrassPatch cx={2.70} cz={1.85} radius={0.15} count={14} seed={207} alt />
          <GrassPatch cx={2.50} cz={2.10} radius={0.15} count={14} seed={208} alt />
          <GrassPatch cx={2.20} cz={2.30} radius={0.15} count={14} seed={209} alt />
          <GrassPatch cx={2.80} cz={2.25} radius={0.15} count={14} seed={210} alt />
          <GrassPatch cx={2.45} cz={2.50} radius={0.15} count={14} seed={211} alt />
          <GrassPatch cx={2.15} cz={1.10} radius={0.10} count={12} seed={212} alt />
          <GrassPatch cx={2.45} cz={1.15} radius={0.10} count={12} seed={213} alt />
          <GrassPatch cx={2.75} cz={1.12} radius={0.10} count={12} seed={214} alt />
          <GrassPatch cx={2.95} cz={1.25} radius={0.10} count={12} seed={215} alt />
          <GrassPatch cx={2.15} cz={1.35} radius={0.10} count={12} seed={216} alt />
          <GrassPatch cx={2.40} cz={1.42} radius={0.10} count={12} seed={217} alt />
          <GrassPatch cx={2.70} cz={1.48} radius={0.10} count={12} seed={218} alt />
          <GrassPatch cx={2.95} cz={1.70} radius={0.10} count={12} seed={219} alt />
          <GrassPatch cx={2.15} cz={1.72} radius={0.10} count={12} seed={220} alt />
          <GrassPatch cx={2.40} cz={1.75} radius={0.10} count={12} seed={221} alt />
          <GrassPatch cx={2.70} cz={1.72} radius={0.10} count={12} seed={222} alt />
          <GrassPatch cx={2.95} cz={2.00} radius={0.10} count={12} seed={223} alt />
          <GrassPatch cx={2.15} cz={2.05} radius={0.10} count={12} seed={224} alt />
          <GrassPatch cx={2.40} cz={2.00} radius={0.10} count={12} seed={225} alt />
          <GrassPatch cx={2.70} cz={2.05} radius={0.10} count={12} seed={226} alt />
          <GrassPatch cx={2.95} cz={2.35} radius={0.10} count={12} seed={227} alt />
          <GrassPatch cx={2.15} cz={2.40} radius={0.10} count={12} seed={228} alt />
          <GrassPatch cx={2.40} cz={2.35} radius={0.10} count={12} seed={229} alt />
          <GrassPatch cx={2.70} cz={2.38} radius={0.10} count={12} seed={230} alt />
          <GrassPatch cx={2.50} cz={1.10} radius={0.10} count={12} seed={231} alt />
          <GrassPatch cx={2.50} cz={1.38} radius={0.10} count={12} seed={232} alt />
          <GrassPatch cx={2.50} cz={1.65} radius={0.10} count={12} seed={233} alt />
          <GrassPatch cx={2.50} cz={1.95} radius={0.10} count={12} seed={234} alt />
          <GrassPatch cx={2.50} cz={2.25} radius={0.10} count={12} seed={235} alt />
          <GrassPatch cx={2.22} cz={1.08} radius={0.08} count={10} seed={236} alt />
          <GrassPatch cx={2.38} cz={1.22} radius={0.08} count={10} seed={237} alt />
          <GrassPatch cx={2.52} cz={1.08} radius={0.08} count={10} seed={238} alt />
          <GrassPatch cx={2.68} cz={1.18} radius={0.08} count={10} seed={239} alt />
          <GrassPatch cx={2.82} cz={1.08} radius={0.08} count={10} seed={240} alt />
          <GrassPatch cx={2.95} cz={1.15} radius={0.08} count={10} seed={241} alt />
          <GrassPatch cx={2.18} cz={1.25} radius={0.08} count={10} seed={242} alt />
          <GrassPatch cx={2.32} cz={1.32} radius={0.08} count={10} seed={243} alt />
          <GrassPatch cx={2.48} cz={1.28} radius={0.08} count={10} seed={244} alt />
          <GrassPatch cx={2.62} cz={1.35} radius={0.08} count={10} seed={245} alt />
          <GrassPatch cx={2.78} cz={1.28} radius={0.08} count={10} seed={246} alt />
          <GrassPatch cx={2.92} cz={1.38} radius={0.08} count={10} seed={247} alt />
          <GrassPatch cx={2.22} cz={1.48} radius={0.08} count={10} seed={248} alt />
          <GrassPatch cx={2.35} cz={1.52} radius={0.08} count={10} seed={249} alt />
          <GrassPatch cx={2.52} cz={1.48} radius={0.08} count={10} seed={250} alt />
          <GrassPatch cx={2.65} cz={1.55} radius={0.08} count={10} seed={251} alt />
          <GrassPatch cx={2.80} cz={1.48} radius={0.08} count={10} seed={252} alt />
          <GrassPatch cx={2.93} cz={1.55} radius={0.08} count={10} seed={253} alt />
          <GrassPatch cx={2.18} cz={1.62} radius={0.08} count={10} seed={254} alt />
          <GrassPatch cx={2.32} cz={1.68} radius={0.08} count={10} seed={255} alt />
          <GrassPatch cx={2.48} cz={1.62} radius={0.08} count={10} seed={256} alt />
          <GrassPatch cx={2.62} cz={1.68} radius={0.08} count={10} seed={257} alt />
          <GrassPatch cx={2.78} cz={1.62} radius={0.08} count={10} seed={258} alt />
          <GrassPatch cx={2.92} cz={1.72} radius={0.08} count={10} seed={259} alt />
          <GrassPatch cx={2.22} cz={1.82} radius={0.08} count={10} seed={260} alt />
          <GrassPatch cx={2.38} cz={1.78} radius={0.08} count={10} seed={261} alt />
          <GrassPatch cx={2.52} cz={1.82} radius={0.08} count={10} seed={262} alt />
          <GrassPatch cx={2.68} cz={1.78} radius={0.08} count={10} seed={263} alt />
          <GrassPatch cx={2.82} cz={1.85} radius={0.08} count={10} seed={264} alt />
          <GrassPatch cx={2.95} cz={1.88} radius={0.08} count={10} seed={265} alt />
          <GrassPatch cx={2.18} cz={1.98} radius={0.08} count={10} seed={266} alt />
          <GrassPatch cx={2.32} cz={2.02} radius={0.08} count={10} seed={267} alt />
          <GrassPatch cx={2.48} cz={1.98} radius={0.08} count={10} seed={268} alt />
          <GrassPatch cx={2.62} cz={2.05} radius={0.08} count={10} seed={269} alt />
          <GrassPatch cx={2.78} cz={1.98} radius={0.08} count={10} seed={270} alt />
          <GrassPatch cx={2.92} cz={2.08} radius={0.08} count={10} seed={271} alt />
          <GrassPatch cx={2.22} cz={2.18} radius={0.08} count={10} seed={272} alt />
          <GrassPatch cx={2.35} cz={2.22} radius={0.08} count={10} seed={273} alt />
          <GrassPatch cx={2.52} cz={2.18} radius={0.08} count={10} seed={274} alt />
          <GrassPatch cx={2.65} cz={2.25} radius={0.08} count={10} seed={275} alt />
          <GrassPatch cx={2.80} cz={2.18} radius={0.08} count={10} seed={276} alt />
          <GrassPatch cx={2.93} cz={2.28} radius={0.08} count={10} seed={277} alt />
          <GrassPatch cx={2.18} cz={2.42} radius={0.08} count={10} seed={278} alt />
          <GrassPatch cx={2.32} cz={2.48} radius={0.08} count={10} seed={279} alt />
          <GrassPatch cx={2.48} cz={2.42} radius={0.08} count={10} seed={280} alt />
          <GrassPatch cx={2.62} cz={2.48} radius={0.08} count={10} seed={281} alt />
          <GrassPatch cx={2.78} cz={2.42} radius={0.08} count={10} seed={282} alt />
          <GrassPatch cx={2.92} cz={2.52} radius={0.08} count={10} seed={283} alt />
          <GrassPatch cx={2.35} cz={2.58} radius={0.08} count={10} seed={284} alt />
          <GrassPatch cx={2.62} cz={2.58} radius={0.08} count={10} seed={285} alt />

          {/* Farm — east of the arguing pair */}
          <MapWindmill modelPath="/models/farm/TowerWindmill.fbx" position={[2.65, 0, 1.25]} rotationY={0} scale={0.0004} yOffset={0.05} />
          <GrassPatch cx={2.65} cz={1.25} radius={0.25} count={50} seed={400} scale={0.028} />
          <GrassPatch cx={2.65} cz={1.25} radius={0.25} count={50} seed={401} scale={0.028} alt />
          <MapFarmBuilding modelPath="/models/farm/BigBarn.fbx"        position={[2.50, 0, 2.15]} rotationY={Math.PI * 0.5}  scale={0.0004} yOffset={0.05} color="#8fa870" />
          <MapFarmBuilding modelPath="/models/farm/SmallBarn.fbx"      position={[2.55, 0, 1.60]} rotationY={Math.PI}        scale={0.0005} yOffset={0.05} color="#8fa870" />
          <MapPerson modelPath="/models/people/Opening.fbx" scale={0.09} position={[2.50, 0, 1.90]} rotationY={Math.PI} yOffset={0.04} />
          <GrassPatch cx={2.50} cz={1.90} radius={0.12} count={50} seed={700} scale={0.018} clipToIsland={false} />
          <GrassPatch cx={2.50} cz={1.90} radius={0.18} count={60} seed={701} scale={0.014} clipToIsland={false} alt />
          <GrassPatch cx={2.50} cz={1.90} radius={0.22} count={50} seed={702} scale={0.016} clipToIsland={false} />
          <GrassPatch cx={2.50} cz={1.90} radius={0.22} count={50} seed={703} scale={0.012} clipToIsland={false} alt />
          <MapFarmBuilding modelPath="/models/farm/ChickenCoop.fbx"    position={[2.30, 0, 1.95]} rotationY={Math.PI * 0.5}  scale={0.0006} yOffset={0.05} color="#8fa870" />
          <MapFarmBuilding modelPath="/models/farm/Well.fbx"           position={[2.45, 0, 1.65]} rotationY={0}              scale={0.0004} yOffset={0.05} color="#7a6a40" />
          <MapFarmBuilding modelPath="/models/farm/Silo.fbx"           position={[2.30, 0, 1.65]} rotationY={0}              scale={0.0004} yOffset={0.05} color="#8fa870" />


          <GrassPatch cx={1.72} cz={3.75} radius={0.4} count={12} seed={77} />
          <GrassPatch cx={1.72} cz={3.75} radius={0.6} count={20} seed={13} />
          <GrassPatch cx={1.72} cz={3.75} radius={0.8} count={16} seed={42} />

          <MapPerson modelPath="/models/people/peasant_2_pick.fbx" scale={0.09} position={[-1.5, 0, 0.5]} rotationY={Math.PI * 0.25} />
          <Planter position={[-1.38, 0, 0.42]} flowerIndex={0} />
          <MapPerson modelPath="/models/people/Plant_A _Plant.fbx" scale={0.09} position={[-1.60, 0, 0.55]} rotationY={0} />

          <MapPerson modelPath="/models/people/peasant_2_pick.fbx" scale={0.09} position={[-2.0, 0, 3.2]} rotationY={-Math.PI * 0.4} />
          <Planter position={[-1.88, 0, 3.10]} flowerIndex={1} />
          <MapPerson modelPath="/models/people/Plant_A _Plant.fbx" scale={0.09} position={[-2.10, 0, 3.25]} rotationY={0.5} />

          {/* Centre — Kandy region */}
          <MapPerson modelPath="/models/people/peasant_2_pick.fbx" scale={0.09} position={[-0.10, 0, 0.30]} rotationY={Math.PI * 0.6} />
          <MapPerson modelPath="/models/people/Plant_A _Plant.fbx" scale={0.09} position={[ 0.05, 0, 0.22]} rotationY={-0.4} />

          {active && PLACES.map((place) => (
            <PlaceMarker
              key={place.id}
              place={place}
              onClick={onPlaceSelect}
              isSelected={selectedPlace?.id === place.id}
            />
          ))}
          <MapReadySignal onReady={onReady} />
        </Suspense>
      </group>

      {/* Controls only active when map is visible and not in player-control mode */}
      {active && !selectedAvatar && (
        <>
          <CameraKeyControl orbitRef={orbitRef} onStart={handleOrbitStart} onEnd={handleOrbitEnd} />
          <CameraController
            position={camPos}
            target={camTarget}
            enableOrbit
            orbitRef={orbitRef}
          />
          <OrbitControls
            ref={orbitRef}
            enablePan={false}
            enableZoom={true}
            minDistance={6}
            maxDistance={36}
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI / 2.1}
            zoomSpeed={0.8}
            target={[0, 0.5, -1.5]}
            autoRotate={autoRotate && rotationEnabled}
            autoRotateSpeed={1.2}
            onStart={handleOrbitStart}
            onEnd={handleOrbitEnd}
          />
        </>
      )}
    </>
  );
}
