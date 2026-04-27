"use client";
import { useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import * as THREE from "three";
import { pip, edgeDist, sampleTerrainHeight } from "@/lib/terrain";

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ROCK_PATHS = [
  "/models/nature/Rock_Medium_1.gltf",
  "/models/nature/Rock_Medium_2.gltf",
  "/models/nature/Rock_Medium_3.gltf",
  "/models/nature/Pebble_Round_1.gltf",
  "/models/nature/Pebble_Round_3.gltf",
];

const GRASS_PATHS = [
  "/models/nature/Grass_Wheat.gltf",
  "/models/nature/Grass_Wispy_Tall.gltf",
];

ROCK_PATHS.forEach(p => useGLTF.preload(p));
GRASS_PATHS.forEach(p => useGLTF.preload(p));

type Pos5 = [number, number, number, number, number]; // x y z scale rot

// Yala SE coast band — world x: 0.55–2.10, z: 3.60–5.25
const ROCK_POSITIONS: Pos5[] = (() => {
  const rand = seededRand(7331);
  const result: Pos5[] = [];
  for (let i = 0; i < 900; i++) {
    const wx = 0.55 + rand() * 1.55;
    const wz = 3.60 + rand() * 1.65;
    if (!pip(wx, wz)) continue;
    const ed = edgeDist(wx, wz);
    if (ed > 0.40 || ed < 0.015) continue;
    result.push([wx, sampleTerrainHeight(wx, wz), wz, 0.012 + rand() * 0.022, rand() * Math.PI * 2]);
  }
  return result;
})();

const GRASS_POSITIONS: Pos5[] = (() => {
  const rand = seededRand(4723);
  const result: Pos5[] = [];
  for (let i = 0; i < 1400; i++) {
    const wx = 0.50 + rand() * 1.65;
    const wz = 3.55 + rand() * 1.75;
    if (!pip(wx, wz)) continue;
    const ed = edgeDist(wx, wz);
    if (ed > 0.46 || ed < 0.01) continue;
    result.push([wx, sampleTerrainHeight(wx, wz), wz, 0.016 + rand() * 0.016, rand() * Math.PI * 2]);
  }
  return result;
})();

const ROCK_COLOR  = new THREE.Color(0.72, 0.56, 0.24);
const GRASS_COLOR = new THREE.Color(0.84, 0.72, 0.26);

function buildTinted(scene: THREE.Group, positions: Pos5[], color: THREE.Color): THREE.InstancedMesh[] {
  if (positions.length === 0) return [];
  const dummy = new THREE.Object3D();
  const list: THREE.InstancedMesh[] = [];
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const baseMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const mat = (baseMat as THREE.MeshStandardMaterial).clone();
    mat.color.set(color);
    mat.needsUpdate = true;
    const im = new THREE.InstancedMesh(mesh.geometry, mat, positions.length);
    im.receiveShadow = true;
    positions.forEach(([x, y, z, scale, rot], i) => {
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, rot, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
    list.push(im);
  });
  return list;
}

export default function YalaShoreDecoration() {
  const rockScenes  = ROCK_PATHS.map(p => (useGLTF(p) as GLTF).scene);
  const grassScenes = GRASS_PATHS.map(p => (useGLTF(p) as GLTF).scene);

  const all = useMemo(() => {
    const nr = rockScenes.length, ng = grassScenes.length;
    return [
      ...rockScenes.flatMap((s, vi) =>
        buildTinted(s, ROCK_POSITIONS.filter((_, i) => i % nr === vi), ROCK_COLOR)
      ),
      ...grassScenes.flatMap((s, vi) =>
        buildTinted(s, GRASS_POSITIONS.filter((_, i) => i % ng === vi), GRASS_COLOR)
      ),
    ];
  }, [rockScenes, grassScenes]);

  useEffect(() => () => { all.forEach(im => im.dispose()); }, [all]);

  return <>{all.map((im, i) => <primitive key={i} object={im} />)}</>;
}
