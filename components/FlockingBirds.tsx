"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { idlePreload } from "@/lib/preload";
import * as THREE from "three";
import { BoidBird } from "@/models/BoidBird";
import { BoidVector } from "@/models/BoidVector";
import { pip, sampleTerrainHeight } from "@/lib/terrain";

// ── Group definitions — each has a home center, patrol bounds, and bird count ──
interface GroupDef {
  cx: number; cy: number; cz: number;  // home center
  bx: number; by: number; bz: number;  // half-extents of patrol volume
  count: number;
}

const GROUPS: GroupDef[] = [
  // large flocks
  { cx:  0.0, cy: 2.8, cz:  0.5, bx: 4.0, by: 2.5, bz: 5.0, count: 7 }, // central highlands
  { cx:  2.3, cy: 2.0, cz:  1.5, bx: 2.5, by: 2.5, bz: 5.0, count: 6 }, // east coast
  { cx:  1.0, cy: 2.0, cz:  4.0, bx: 3.0, by: 2.0, bz: 3.0, count: 5 }, // south / Yala
  { cx: -0.3, cy: 2.5, cz: -4.0, bx: 3.0, by: 2.0, bz: 3.0, count: 4 }, // north
  // pairs
  { cx: -2.8, cy: 2.2, cz:  0.5, bx: 2.0, by: 2.0, bz: 3.0, count: 2 }, // pair west coast
  { cx: -2.0, cy: 2.0, cz:  3.5, bx: 2.0, by: 2.0, bz: 2.5, count: 2 }, // pair SW
  { cx:  0.6, cy: 2.2, cz: -2.5, bx: 2.0, by: 2.0, bz: 2.5, count: 2 }, // pair NW inland
  // solo scouts
  { cx:  1.5, cy: 2.5, cz: -2.0, bx: 2.0, by: 1.5, bz: 2.0, count: 1 }, // solo NE
  { cx: -1.0, cy: 2.5, cz: -5.5, bx: 2.0, by: 1.5, bz: 2.0, count: 1 }, // solo far north
  { cx: -3.0, cy: 2.2, cz:  2.5, bx: 1.8, by: 1.5, bz: 1.8, count: 1 }, // solo SW shore
];
// total: 7+6+5+4+2+2+2+1+1+1 = 31
const NUM_BIRDS = GROUPS.reduce((s, g) => s + g.count, 0);

// Map bird ID → group index (built from GROUPS)
const BIRD_TO_GROUP: number[] = (() => {
  const arr: number[] = [];
  GROUPS.forEach((g, gi) => { for (let i = 0; i < g.count; i++) arr.push(gi); });
  return arr;
})();

const GROUP_CENTERS = GROUPS.map(g => new THREE.Vector3(g.cx, g.cy, g.cz));
const GROUP_BOUNDS  = GROUPS.map(g => ({ x: g.bx, y: g.by, z: g.bz }));

// ── Boid constants ────────────────────────────────────────────────────────────
const C = {
  turnFactor:     0.7,
  visualRange:    2.4,
  protectedRange: 0.55,
  centering:      0.003,
  avoid:          0.08,
  matching:       0.05,
  maxSpeed:       2.8,
  minSpeed:       0.7,
  maxBias:        0.01,
  biasIncrm:      0.00004,
};

// ── Boid update ───────────────────────────────────────────────────────────────
function flockUpdate(
  bird:    BoidBird,
  birds:   BoidBird[],
  grid:    Map<string, BoidBird[]>,
  maxRange:number,
  delta:   number,
  center:  THREE.Vector3,
  bounds:  { x: number; y: number; z: number },
): void {
  const posAcc = new BoidVector({ x: 0, y: 0, z: 0 });
  const velAcc = new BoidVector({ x: 0, y: 0, z: 0 });
  const close  = new BoidVector({ x: 0, y: 0, z: 0 });
  let neighbors = 0;

  for (const key of bird.getNeighbors(maxRange)) {
    const cell = grid.get(key);
    if (!cell) continue;
    for (const nb of cell) {
      if (nb.id === bird.id) continue;
      const dist = bird.pos.distanceTo(nb.pos);
      if (dist < C.visualRange) {
        posAcc.add(nb.pos); velAcc.add(nb.vel); neighbors++;
      }
      if (dist < C.protectedRange) close.add(bird.pos.diff(nb.pos));
    }
  }

  if (neighbors > 0) {
    bird.incremVXYZ(posAcc.div(neighbors).diff(bird.pos).prod(C.centering));
    bird.incremVXYZ(velAcc.div(neighbors).diff(bird.vel).prod(C.matching));
  }
  bird.incremVXYZ(close.prod(C.avoid));

  // Soft boundary turning — group-specific center + bounds
  const hx = bounds.x / 2, hy = bounds.y / 2, hz = bounds.z / 2;
  const { x: cx, y: cy, z: cz } = center;
  if (bird.pos.x > cx + hx) bird.incremVX(-C.turnFactor * delta);
  if (bird.pos.x < cx - hx) bird.incremVX( C.turnFactor * delta);
  if (bird.pos.y > cy + hy) bird.incremVY(-C.turnFactor * delta);
  if (bird.pos.y < cy - hy) bird.incremVY( C.turnFactor * delta);
  if (bird.pos.z > cz + hz) bird.incremVZ(-C.turnFactor * delta);
  if (bird.pos.z < cz - hz) bird.incremVZ( C.turnFactor * delta);

  // Directional bias groups
  if (bird.inBiasGroup1(birds.length)) {
    bird.setBias(bird.vel.x > 0
      ? Math.min(C.maxBias, bird.bias + C.biasIncrm)
      : Math.max(C.biasIncrm, bird.bias - C.biasIncrm));
    bird.setVX((1 - bird.bias) * bird.vel.x + bird.bias);
  }
  if (bird.inBiasGroup2(birds.length)) {
    bird.setBias(bird.vel.x < 0
      ? Math.min(C.maxBias, bird.bias + C.biasIncrm)
      : Math.max(C.biasIncrm, bird.bias - C.biasIncrm));
    bird.setVX((1 - bird.bias) * bird.vel.x - bird.bias);
  }

  // Terrain-aware floor — sampleTerrainHeight returns actual hill height over
  // land and 0 over water, so this handles both surfaces in one pass.
  const CLEARANCE  = 0.45;  // min height above surface
  const STEER_ZONE = 0.70;  // begin steering this far above the floor
  const surfaceY = sampleTerrainHeight(bird.pos.x, bird.pos.z);
  const floorY   = surfaceY + CLEARANCE;
  if (bird.pos.y < floorY + STEER_ZONE) {
    const urgency = Math.max(0, (floorY + STEER_ZONE - bird.pos.y) / STEER_ZONE);
    bird.incremVY(C.turnFactor * (2.0 + urgency * 4.5) * delta);
  }

  // Speed clamp
  const spd = bird.getSpeed();
  if (spd < C.minSpeed) bird.setVXYZ(bird.vel.div(spd).prod(C.minSpeed));
  if (spd > C.maxSpeed) bird.setVXYZ(bird.vel.div(spd).prod(C.maxSpeed));

  bird.move(delta);

  // Hard floor — absolute last resort, cannot clip through surface
  if (bird.pos.y < floorY) {
    bird.pos.setY(floorY);
    if (bird.vel.y < 0) bird.vel.setY(0);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlockingBirds() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/models/bird.gltf") as any;

  const bodyGeo  = useMemo(() => (nodes.body  as THREE.Mesh)?.geometry, [nodes]);
  const wing1Geo = useMemo(() => (nodes.wing1 as THREE.Mesh)?.geometry, [nodes]);
  const wing2Geo = useMemo(() => (nodes.wing2 as THREE.Mesh)?.geometry, [nodes]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 }), []);

  const birdsRef = useRef<BoidBird[]>([]);
  useMemo(() => {
    const rng = (min: number, max: number) => Math.random() * (max - min) + min;
    birdsRef.current = Array.from({ length: NUM_BIRDS }, (_, i) => {
      const gi = BIRD_TO_GROUP[i];
      const g  = GROUPS[gi];
      return new BoidBird({
        id: i,
        pos: new BoidVector({
          x: g.cx + rng(-g.bx * 0.30, g.bx * 0.30),
          y: g.cy + rng(-g.by * 0.25, g.by * 0.25),
          z: g.cz + rng(-g.bz * 0.30, g.bz * 0.30),
        }),
        vel: new BoidVector({ x: rng(-1.5, 1.5), y: rng(-0.3, 0.3), z: rng(-1.5, 1.5) }),
        bias: 0,
        flapOffset: rng(0, Math.PI * 2),
      });
    });
  }, []);

  const groupRefs = useRef<(THREE.Group | null)[]>(Array(NUM_BIRDS).fill(null));
  const wing1Refs = useRef<(THREE.Mesh  | null)[]>(Array(NUM_BIRDS).fill(null));
  const wing2Refs = useRef<(THREE.Mesh  | null)[]>(Array(NUM_BIRDS).fill(null));

  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const maxRange   = Math.max(C.protectedRange, C.visualRange) * 2;

  useFrame(({ clock }, delta) => {
    const birds = birdsRef.current;
    if (!birds.length) return;

    const time = clock.getElapsedTime();

    const grid = new Map<string, BoidBird[]>();
    for (const b of birds) {
      const key = JSON.stringify(b.getGrid(maxRange));
      const cell = grid.get(key);
      if (cell) cell.push(b); else grid.set(key, [b]);
    }

    for (const b of birds) {
      const gi = BIRD_TO_GROUP[b.id] ?? 0;
      flockUpdate(b, birds, grid, maxRange, delta, GROUP_CENTERS[gi], GROUP_BOUNDS[gi]);
    }

    for (let i = 0; i < NUM_BIRDS; i++) {
      const g  = groupRefs.current[i];
      const b  = birds[i];
      const w1 = wing1Refs.current[i];
      const w2 = wing2Refs.current[i];
      if (!g || !w1 || !w2) continue;

      g.position.set(b.pos.x, b.pos.y, b.pos.z);
      lookTarget.set(b.pos.x + b.vel.x, b.pos.y + b.vel.y, b.pos.z + b.vel.z);
      g.lookAt(lookTarget);

      const flap = b.wingAnimation(time);
      w1.rotation.z =  flap;
      w2.rotation.z = -flap;
    }
  });

  if (!bodyGeo || !wing1Geo || !wing2Geo) return null;

  return (
    <>
      {Array.from({ length: NUM_BIRDS }, (_, i) => (
        <group
          key={i}
          ref={(g) => { groupRefs.current[i] = g; }}
          scale={0.05}
        >
          <mesh geometry={bodyGeo} material={mat} />
          <mesh
            geometry={wing1Geo} material={mat}
            position={[0, -0.2, 0]}
            ref={(m) => { wing1Refs.current[i] = m; }}
          />
          <mesh
            geometry={wing2Geo} material={mat}
            position={[0, -0.2, 0]}
            ref={(m) => { wing2Refs.current[i] = m; }}
          />
        </group>
      ))}
    </>
  );
}

idlePreload(["/models/bird.gltf"]);
