"use client";
import { useMemo, useEffect } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import { idlePreload } from "@/lib/preload";
import { useLoader, useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { GLTF } from "three-stdlib";
import * as THREE from "three";
import { sampleTerrainHeight, pip, edgeDist } from "@/lib/terrain";

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ── Wind animation ────────────────────────────────────────────────────────────
const windUniforms = { uTime: { value: 0 } };

function patchWindSway(scene: THREE.Object3D): void {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const m = mat as THREE.MeshStandardMaterial & { _windPatched?: boolean };
      if (!m?.isMeshStandardMaterial || m._windPatched) continue;
      m._windPatched = true;
      m.onBeforeCompile = (shader) => {
        shader.uniforms.uWindTime = windUniforms.uTime;
        shader.vertexShader = 'uniform float uWindTime;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          { float _ht = max(0.0, position.y) * 0.045;
            _ht = min(_ht, 3.2);
            float _ph = uWindTime * 1.4 + position.x * 0.4 + position.z * 0.3;
            transformed.x += sin(_ph) * _ht;
            transformed.z += cos(_ph * 0.7 + 1.1) * _ht * 0.7; }`
        );
      };
      m.needsUpdate = true;
    }
  });
}

const COMMON_TREES = [
  "/models/nature/CommonTree_1.gltf",
  "/models/nature/CommonTree_2.gltf",
  "/models/nature/CommonTree_3.gltf",
  "/models/nature/CommonTree_4.gltf",
  "/models/nature/CommonTree_5.gltf",
];
const PINES = [
  "/models/nature/Pine_1.gltf",
  "/models/nature/Pine_2.gltf",
  "/models/nature/Pine_3.gltf",
];
const TWISTED = [
  "/models/nature/TwistedTree_1.gltf",
  "/models/nature/TwistedTree_2.gltf",
];
const ROCKS = [
  "/models/nature/Rock_Medium_1.gltf",
  "/models/nature/Rock_Medium_2.gltf",
  "/models/nature/Rock_Medium_3.gltf",
];
const BUSHES = ["/models/nature/Bush_Common.gltf"];
const FLOWERS = ["/models/nature/Bush_Common_Flowers.gltf"];
const FERNS = ["/models/nature/Fern_1.gltf"];
const DEAD_TREES = [
  "/models/nature/DeadTree_1.gltf",
  "/models/nature/DeadTree_2.gltf",
  "/models/nature/DeadTree_3.gltf",
  "/models/nature/DeadTree_4.gltf",
  "/models/nature/DeadTree_5.gltf",
];
const FLOWER_GROUPS = [
  "/models/nature/Flower_3_Group.gltf",
  "/models/nature/Flower_4_Group.gltf",
];
// Wide_Short only — flattest footprint, best carpet coverage
const GRASSES = [
  "/models/nature/Grass_Wide_Short.gltf",
];

// ── Pro pack — available for future use, not yet placed ───────────────────
const BIRCHES = [
  "/models/nature/Birch_1.gltf",
  "/models/nature/Birch_2.gltf",
  "/models/nature/Birch_3.gltf",
  "/models/nature/Birch_4.gltf",
  "/models/nature/Birch_5.gltf",
];
const CHERRY_BLOSSOMS = [
  "/models/nature/CherryBlossom_1.gltf",
  "/models/nature/CherryBlossom_2.gltf",
  "/models/nature/CherryBlossom_3.gltf",
  "/models/nature/CherryBlossom_4.gltf",
  "/models/nature/CherryBlossom_5.gltf",
];
const GIANT_PINES = [
  "/models/nature/GiantPine_1.gltf",
  "/models/nature/GiantPine_2.gltf",
  "/models/nature/GiantPine_3.gltf",
  "/models/nature/GiantPine_4.gltf",
  "/models/nature/GiantPine_5.gltf",
];
const TALL_THICK = [
  "/models/nature/TallThick_1.gltf",
  "/models/nature/TallThick_2.gltf",
  "/models/nature/TallThick_3.gltf",
  "/models/nature/TallThick_4.gltf",
  "/models/nature/TallThick_5.gltf",
];
const PLANTS = [
  "/models/nature/Plant_1.gltf",
  "/models/nature/Plant_1_Big.gltf",
  "/models/nature/Plant_2.gltf",
  "/models/nature/Plant_2_Big.gltf",
  "/models/nature/Plant_3.gltf",
  "/models/nature/Plant_4.gltf",
  "/models/nature/Plant_5.gltf",
  "/models/nature/Plant_6.gltf",
  "/models/nature/Plant_7.gltf",
  "/models/nature/Plant_7_Big.gltf",
];
const MUSHROOMS = [
  "/models/nature/Mushroom_Common.gltf",
  "/models/nature/Mushroom_Laetiporus.gltf",
  "/models/nature/Mushroom_Oyster.gltf",
  "/models/nature/Mushroom_RedCap.gltf",
];
const BUSHES_LARGE = [
  "/models/nature/Bush_Large.gltf",
  "/models/nature/Bush_Large_Flowers.gltf",
  "/models/nature/Bush_Long_1.gltf",
  "/models/nature/Bush_Long_2.gltf",
];
const FLOWERS_EXTRA = [
  "/models/nature/Flower_1_Group.gltf",
  "/models/nature/Flower_2_Group.gltf",
  "/models/nature/Flower_6.gltf",
  "/models/nature/Flower_7_Group.gltf",
];
const ROCKS_BIG = [
  "/models/nature/Rock_Big_1.gltf",
  "/models/nature/Rock_Big_2.gltf",
  "/models/nature/Rock_Medium_4.gltf",
];
const PEBBLES = [
  "/models/nature/Pebble_Round_1.gltf",
  "/models/nature/Pebble_Round_2.gltf",
  "/models/nature/Pebble_Round_3.gltf",
  "/models/nature/Pebble_Round_4.gltf",
  "/models/nature/Pebble_Round_5.gltf",
  "/models/nature/Pebble_Square_1.gltf",
  "/models/nature/Pebble_Square_2.gltf",
  "/models/nature/Pebble_Square_3.gltf",
];
const TWISTED_EXTRA = [
  "/models/nature/TwistedTree_3.gltf",
  "/models/nature/TwistedTree_4.gltf",
  "/models/nature/TwistedTree_5.gltf",
];
const PINE_EXTRA = [
  "/models/nature/Pine_4.gltf",
  "/models/nature/Pine_5.gltf",
];
const FERNS_EXTRA = ["/models/nature/Fern_2.gltf"];

// ── KayKit Forest Pack — green (Color1) variants ──────────────────────────
const KAYKIT_TREES = [
  "/models/nature/Tree_1_A_Color1.gltf",
  "/models/nature/Tree_1_B_Color1.gltf",
  "/models/nature/Tree_1_C_Color1.gltf",
  "/models/nature/Tree_2_A_Color1.gltf",
  "/models/nature/Tree_2_B_Color1.gltf",
  "/models/nature/Tree_2_C_Color1.gltf",
  "/models/nature/Tree_2_D_Color1.gltf",
  "/models/nature/Tree_2_E_Color1.gltf",
  "/models/nature/Tree_3_A_Color1.gltf",
  "/models/nature/Tree_3_B_Color1.gltf",
  "/models/nature/Tree_3_C_Color1.gltf",
  "/models/nature/Tree_4_A_Color1.gltf",
  "/models/nature/Tree_4_B_Color1.gltf",
  "/models/nature/Tree_4_C_Color1.gltf",
];
const KAYKIT_BARE_TREES = [
  "/models/nature/Tree_Bare_1_A_Color1.gltf",
  "/models/nature/Tree_Bare_1_B_Color1.gltf",
  "/models/nature/Tree_Bare_1_C_Color1.gltf",
  "/models/nature/Tree_Bare_2_A_Color1.gltf",
  "/models/nature/Tree_Bare_2_B_Color1.gltf",
  "/models/nature/Tree_Bare_2_C_Color1.gltf",
];
const KAYKIT_GRASSES = [
  "/models/nature/Grass_1_A_Color1.gltf",
  "/models/nature/Grass_1_B_Color1.gltf",
  "/models/nature/Grass_1_C_Color1.gltf",
  "/models/nature/Grass_1_D_Color1.gltf",
  "/models/nature/Grass_2_A_Color1.gltf",
  "/models/nature/Grass_2_B_Color1.gltf",
  "/models/nature/Grass_2_C_Color1.gltf",
  "/models/nature/Grass_2_D_Color1.gltf",
];
const KAYKIT_BUSHES = [
  "/models/nature/Bush_1_A_Color1.gltf",
  "/models/nature/Bush_1_B_Color1.gltf",
  "/models/nature/Bush_1_C_Color1.gltf",
  "/models/nature/Bush_1_D_Color1.gltf",
  "/models/nature/Bush_1_E_Color1.gltf",
  "/models/nature/Bush_1_F_Color1.gltf",
  "/models/nature/Bush_1_G_Color1.gltf",
  "/models/nature/Bush_2_A_Color1.gltf",
  "/models/nature/Bush_2_B_Color1.gltf",
  "/models/nature/Bush_2_C_Color1.gltf",
  "/models/nature/Bush_2_D_Color1.gltf",
  "/models/nature/Bush_2_E_Color1.gltf",
  "/models/nature/Bush_2_F_Color1.gltf",
  "/models/nature/Bush_3_A_Color1.gltf",
  "/models/nature/Bush_3_B_Color1.gltf",
  "/models/nature/Bush_3_C_Color1.gltf",
  "/models/nature/Bush_4_A_Color1.gltf",
  "/models/nature/Bush_4_B_Color1.gltf",
  "/models/nature/Bush_4_C_Color1.gltf",
  "/models/nature/Bush_4_D_Color1.gltf",
  "/models/nature/Bush_4_E_Color1.gltf",
  "/models/nature/Bush_4_F_Color1.gltf",
];

idlePreload([...COMMON_TREES, ...PINES, ...TWISTED, ...ROCKS, ...BUSHES, ...FLOWERS, ...FERNS, ...DEAD_TREES, ...FLOWER_GROUPS, ...GRASSES]);

type ModelSet = "common" | "pine" | "twisted" | "rock" | "bush" | "flower" | "fern" | "dead" | "flowergroup" | "grass";
interface Zone {
  cx: number; cz: number; r: number; n: number;
  s: [number, number];
  m: ModelSet;
  e?: number; // min edge distance (default 0.75, use 0.30 for ground cover)
}

// Dense island-wide coverage — central highlands, mid-hills, lowlands, coasts, north
const ZONES: Zone[] = [
  // ── Central highlands (Kandy / Nuwara Eliya) ─────────────────────────────
  { cx: -0.20, cz:  0.40, r: 1.80, n: 22, s: [0.060, 0.082], m: "pine"    },
  { cx: -0.10, cz:  2.00, r: 1.40, n: 18, s: [0.055, 0.075], m: "pine"    },
  { cx:  0.70, cz:  2.10, r: 1.00, n: 14, s: [0.052, 0.070], m: "pine"    },
  { cx: -0.30, cz:  0.90, r: 1.60, n: 18, s: [0.058, 0.078], m: "common"  },
  { cx:  0.40, cz:  1.10, r: 0.90, n: 10, s: [0.052, 0.070], m: "common"  },
  { cx: -0.10, cz:  1.50, r: 0.80, n:  9, s: [0.050, 0.068], m: "common"  },

  // ── Mid-hills (Ratnapura, Kegalle, Matale, Badulla) ───────────────────────
  { cx: -1.10, cz:  2.60, r: 1.30, n: 16, s: [0.050, 0.068], m: "common"  },
  { cx: -0.50, cz:  2.50, r: 0.90, n: 10, s: [0.048, 0.065], m: "common"  },
  { cx:  0.80, cz:  2.30, r: 0.85, n:  9, s: [0.048, 0.064], m: "common"  },
  { cx: -1.65, cz:  3.60, r: 0.80, n:  9, s: [0.045, 0.062], m: "common"  },
  { cx: -0.80, cz:  4.40, r: 1.00, n: 10, s: [0.044, 0.060], m: "common"  },
  { cx:  1.50, cz:  3.10, r: 0.75, n:  8, s: [0.042, 0.058], m: "common"  },
  { cx:  1.10, cz:  1.80, r: 0.70, n:  7, s: [0.044, 0.060], m: "common"  },

  // ── Western lowlands (Colombo, Gampaha, Kalutara) ─────────────────────────
  { cx: -2.20, cz:  1.20, r: 0.55, n:  8, s: [0.040, 0.055], m: "common"  },
  { cx: -2.00, cz:  2.20, r: 0.60, n:  8, s: [0.038, 0.054], m: "common"  },
  { cx: -1.70, cz:  0.40, r: 0.55, n:  6, s: [0.038, 0.052], m: "common"  },
  { cx: -2.00, cz:  2.80, r: 0.50, n:  6, s: [0.036, 0.050], m: "bush"    },

  // ── Southern coast (Galle, Matara, Hambantota) ────────────────────────────
  { cx: -1.60, cz:  4.00, r: 0.55, n:  7, s: [0.038, 0.054], m: "common"  },
  { cx: -0.50, cz:  4.40, r: 0.50, n:  6, s: [0.036, 0.050], m: "common"  },
  { cx:  0.50, cz:  4.20, r: 0.45, n:  5, s: [0.036, 0.050], m: "common"  },
  { cx: -0.20, cz:  4.30, r: 0.45, n:  5, s: [0.034, 0.048], m: "flower"  },

  // ── Eastern coast (Batticaloa, Ampara, Trincomalee) ───────────────────────
  { cx:  1.80, cz:  0.70, r: 0.60, n:  8, s: [0.038, 0.054], m: "common"  },
  { cx:  1.60, cz:  2.30, r: 0.60, n:  7, s: [0.038, 0.052], m: "common"  },
  { cx:  1.40, cz:  3.50, r: 0.55, n:  6, s: [0.036, 0.050], m: "common"  },
  { cx:  1.70, cz: -0.50, r: 0.55, n:  6, s: [0.036, 0.052], m: "bush"    },
  { cx:  1.60, cz:  1.10, r: 0.50, n:  5, s: [0.036, 0.050], m: "flower"  },

  // ── North-central (Anuradhapura, Polonnaruwa, Kurunegala) — dry-zone scrub ──
  { cx: -0.50, cz: -1.60, r: 1.60, n: 14, s: [0.040, 0.055], m: "common"  },
  { cx:  0.60, cz: -0.80, r: 0.90, n:  9, s: [0.038, 0.054], m: "common"  },
  { cx: -1.50, cz: -0.80, r: 0.85, n:  9, s: [0.038, 0.053], m: "common"  },
  // a few twisted trees as accent only
  { cx: -0.20, cz: -1.20, r: 0.60, n:  3, s: [0.038, 0.050], m: "twisted" },
  { cx:  0.20, cz: -2.40, r: 1.20, n: 11, s: [0.036, 0.052], m: "common"  },
  { cx: -1.20, cz: -2.00, r: 0.80, n:  8, s: [0.036, 0.050], m: "common"  },
  { cx:  1.20, cz: -1.50, r: 0.70, n:  7, s: [0.036, 0.050], m: "common"  },

  // ── Far north (Jaffna, Mannar, Vavuniya) — sparse dry scrub ──────────────
  { cx: -1.20, cz: -4.00, r: 1.40, n: 10, s: [0.034, 0.048], m: "common"  },
  { cx: -0.50, cz: -3.60, r: 1.00, n:  8, s: [0.032, 0.046], m: "common"  },
  // small accent of twisted for variety
  { cx: -0.90, cz: -3.20, r: 0.50, n:  3, s: [0.030, 0.042], m: "twisted" },
  { cx: -0.80, cz: -5.20, r: 0.90, n:  7, s: [0.030, 0.044], m: "bush"    },
  { cx: -1.60, cz: -5.00, r: 0.80, n:  6, s: [0.030, 0.042], m: "bush"    },
  { cx: -0.20, cz: -5.80, r: 0.70, n:  6, s: [0.028, 0.040], m: "flower"  },

  // ── Rocks scattered across highlands + mid ────────────────────────────────
  { cx: -0.16, cz: -0.35, r: 0.80, n:  6, s: [0.045, 0.065], m: "rock"    },
  { cx:  0.50, cz:  1.20, r: 0.55, n:  5, s: [0.040, 0.060], m: "rock"    },
  { cx: -0.60, cz:  2.00, r: 0.60, n:  5, s: [0.040, 0.058], m: "rock"    },
  { cx:  1.20, cz:  2.60, r: 0.55, n:  4, s: [0.038, 0.056], m: "rock"    },
  { cx: -1.40, cz:  1.20, r: 0.60, n:  4, s: [0.038, 0.055], m: "rock"    },

  // ── Flower patches ────────────────────────────────────────────────────────
  { cx: -1.50, cz:  0.50, r: 0.90, n: 10, s: [0.040, 0.055], m: "flower"  },
  { cx:  0.20, cz:  4.10, r: 0.70, n:  8, s: [0.036, 0.050], m: "flower"  },
  { cx: -2.00, cz:  3.20, r: 0.65, n:  7, s: [0.034, 0.048], m: "flower"  },
  { cx:  1.60, cz:  0.70, r: 0.60, n:  6, s: [0.034, 0.048], m: "flower"  },

  // ── Dead trees — sparse accent, reduced count so they don't dominate ────────
  { cx: -0.50, cz: -1.80, r: 1.20, n:  4, s: [0.050, 0.068], m: "dead"       },
  { cx: -1.00, cz: -3.80, r: 1.10, n:  4, s: [0.045, 0.062], m: "dead"       },
  { cx: -0.40, cz: -3.40, r: 0.85, n:  3, s: [0.042, 0.058], m: "dead"       },

  // ── Flower groups (lowlands and mid) ─────────────────────────────────────
  { cx: -1.60, cz:  0.60, r: 0.70, n:  8, s: [0.038, 0.052], m: "flowergroup"},
  { cx:  0.10, cz:  3.90, r: 0.60, n:  7, s: [0.036, 0.050], m: "flowergroup"},
  { cx: -1.90, cz:  3.00, r: 0.55, n:  6, s: [0.034, 0.048], m: "flowergroup"},
  { cx:  1.50, cz:  0.80, r: 0.50, n:  5, s: [0.034, 0.048], m: "flowergroup"},

  // grass carpet handled by GrassCarpet component (InstancedMesh)

  // ── Fern patches (mid-hills and lowlands) ─────────────────────────────────
  { cx: -0.80, cz:  1.80, r: 0.80, n: 10, s: [0.045, 0.065], m: "fern"    },
  { cx:  0.30, cz:  2.60, r: 0.70, n:  8, s: [0.042, 0.060], m: "fern"    },
  { cx: -1.30, cz:  3.00, r: 0.65, n:  7, s: [0.040, 0.058], m: "fern"    },
  { cx:  0.80, cz:  1.50, r: 0.60, n:  6, s: [0.040, 0.056], m: "fern"    },
  { cx: -0.40, cz:  0.80, r: 0.55, n:  6, s: [0.038, 0.055], m: "fern"    },
];

interface PlacedAsset {
  x: number; y: number; z: number;
  scale: number; rot: number;
  modelSet: ModelSet; modelIdx: number;
}

function buildPlacements(): PlacedAsset[] {
  const rand = seededRand(42);
  const result: PlacedAsset[] = [];
  const modelCounts: Record<ModelSet, number> = {
    common: COMMON_TREES.length,
    pine:   PINES.length,
    twisted: TWISTED.length,
    rock:   ROCKS.length,
    bush:        BUSHES.length,
    flower:      FLOWERS.length,
    fern:        FERNS.length,
    dead:        DEAD_TREES.length,
    flowergroup: FLOWER_GROUPS.length,
    grass:       GRASSES.length,
  };
  for (const z of ZONES) {
    for (let i = 0; i < z.n; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * z.r;
      const wx = z.cx + Math.cos(angle) * dist;
      const wz = z.cz + Math.sin(angle) * dist;
      if (!pip(wx, wz)) continue;
      if (edgeDist(wx, wz) < (z.e ?? 0.75)) continue;
      result.push({
        x: wx,
        y: sampleTerrainHeight(wx, wz),
        z: wz,
        scale: z.s[0] + rand() * (z.s[1] - z.s[0]),
        rot: rand() * Math.PI * 2,
        modelSet: z.m,
        modelIdx: Math.floor(rand() * modelCounts[z.m]),
      });
    }
  }
  return result;
}

const PLACEMENTS = buildPlacements();

// ── Instanced ground cover ────────────────────────────────────────────────
const ALL_GRASS_PATHS = [
  "/models/nature/Grass_Wide_Short.gltf",
  "/models/nature/Grass_Common_Short.gltf",
  "/models/nature/Grass_Wispy_Short.gltf",
  "/models/nature/Grass_Wide_Tall.gltf",
  "/models/nature/Grass_Wispy_Tall.gltf",
  "/models/nature/Grass_Wheat.gltf",
  "/models/nature/Grass_1_A_Color1.gltf",
  "/models/nature/Grass_1_B_Color1.gltf",
  "/models/nature/Grass_1_C_Color1.gltf",
  "/models/nature/Grass_1_D_Color1.gltf",
  "/models/nature/Grass_2_A_Color1.gltf",
  "/models/nature/Grass_2_B_Color1.gltf",
  "/models/nature/Grass_2_C_Color1.gltf",
  "/models/nature/Grass_2_D_Color1.gltf",
];
const ROCK_PATHS = [
  "/models/nature/Rock_Medium_1.gltf",
  "/models/nature/Rock_Medium_2.gltf",
  "/models/nature/Rock_Medium_3.gltf",
];
const BUSH_PATHS = [
  "/models/nature/Plant_1.gltf",
  "/models/nature/Plant_7.gltf",
  "/models/nature/Plant_1_Big.gltf",
  "/models/nature/Plant_7_Big.gltf",
];
// Golden / warm coastal grass — fills the sandy strip (edgeDist 0.01–0.10)
const COASTAL_GRASS_PATHS = [
  "/models/nature/Grass_Wheat.gltf",
  "/models/nature/Grass_Wispy_Tall.gltf",
  "/models/nature/Grass_Wide_Short.gltf",
];
const COASTAL_ROCK_PATHS = [
  "/models/nature/Rock_Medium_1.gltf",
  "/models/nature/Rock_Medium_4.gltf",
  "/models/nature/Rock_Big_1.gltf",
  "/models/nature/Rock_Big_2.gltf",
];
// Small pebbles — scattered along all coastlines
const PEBBLE_PATHS = [
  "/models/nature/Pebble_Round_1.gltf",
  "/models/nature/Pebble_Round_2.gltf",
  "/models/nature/Pebble_Round_3.gltf",
  "/models/nature/Pebble_Round_4.gltf",
  "/models/nature/Pebble_Round_5.gltf",
  "/models/nature/Pebble_Square_1.gltf",
  "/models/nature/Pebble_Square_2.gltf",
  "/models/nature/Pebble_Square_3.gltf",
];
idlePreload([...ALL_GRASS_PATHS, ...ROCK_PATHS, ...BUSH_PATHS, ...COASTAL_GRASS_PATHS, ...COASTAL_ROCK_PATHS, ...PEBBLE_PATHS]);

type GrassPos = [number, number, number, number, number]; // x y z scale rot

const SVG_CX = 509, SVG_CY = 525, SVG_SCALE = 0.013;
const EDGE_BUFFER = {
  asset: 0.22,
  grass: 0.20,
  rock: 0.22,
  bush: 0.22,
  coastalMin: 0.045,
  coastalMax: 0.52,
  coastalRockMin: 0.09,
  coastalRockMax: 0.48,
} as const;

interface SvgPoly {
  poly: [number, number][];
  minX: number; maxX: number; minZ: number; maxZ: number;
  area: number;
}

interface CoastSegment {
  ax: number; az: number; bx: number; bz: number;
}

interface LandMask {
  contains: (x: number, z: number) => boolean;
  edgeDistance: (x: number, z: number) => number;
}

function svgToWorld(sx: number, sy: number): [number, number] {
  return [(sx - SVG_CX) * SVG_SCALE, (sy - SVG_CY) * SVG_SCALE];
}

function pointInPoly(wx: number, wz: number, poly: [number, number][]): boolean {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > wz) !== (zj > wz) && wx < (xj - xi) * (wz - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function distanceToSegment(wx: number, wz: number, s: CoastSegment): number {
  const dx = s.bx - s.ax, dz = s.bz - s.az;
  const denom = dx * dx + dz * dz;
  const t = denom < 1e-12 ? 0 : Math.max(0, Math.min(1, ((wx - s.ax) * dx + (wz - s.az) * dz) / denom));
  return Math.hypot(wx - s.ax - t * dx, wz - s.az - t * dz);
}

function polyArea(poly: [number, number][]): number {
  let sum = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [x1, z1] = poly[j], [x2, z2] = poly[i];
    sum += x1 * z2 - x2 * z1;
  }
  return Math.abs(sum) * 0.5;
}

function buildLandMask(svgData: ReturnType<SVGLoader["parse"]>): LandMask {
  const polys: SvgPoly[] = [];

  for (const path of svgData.paths) {
    const node = path.userData?.node as Element | undefined;
    const id = node?.id || node?.getAttribute?.("id") || "";
    if (node?.tagName !== "path" || !id.startsWith("LK")) continue;

    for (const shape of SVGLoader.createShapes(path)) {
      const poly = shape.getPoints(120).map((p) => svgToWorld(p.x, p.y));
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (const [x, z] of poly) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      }
      const area = polyArea(poly);
      if (area < 0.035) continue;
      polys.push({ poly, minX, maxX, minZ, maxZ, area });
    }
  }

  const contains = (x: number, z: number) => polys.some((p) =>
    x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ && pointInPoly(x, z, p.poly)
  );
  const coastSegments: CoastSegment[] = [];
  const EPS = 0.035;

  for (const { poly } of polys) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, az] = poly[j], [bx, bz] = poly[i];
      const dx = bx - ax, dz = bz - az;
      const len = Math.hypot(dx, dz);
      if (len < 1e-9) continue;

      const mx = (ax + bx) * 0.5, mz = (az + bz) * 0.5;
      const nx = -dz / len, nz = dx / len;
      if (contains(mx + nx * EPS, mz + nz * EPS) !== contains(mx - nx * EPS, mz - nz * EPS)) {
        coastSegments.push({ ax, az, bx, bz });
      }
    }
  }

  return {
    contains,
    edgeDistance: (x, z) => {
      let min = Infinity;
      for (const s of coastSegments) {
        const d = distanceToSegment(x, z, s);
        if (d < min) min = d;
      }
      return min;
    },
  };
}

function filterByMask(
  positions: GrassPos[],
  mask: LandMask,
  minEdge: number,
  maxEdge = Infinity,
  radiusFactor = 0,
  minEdgeAt?: (x: number, z: number, base: number) => number
): GrassPos[] {
  return positions.filter(([x, , z, scale]) => {
    if (!mask.contains(x, z)) return false;
    const ed = mask.edgeDistance(x, z);
    const localMinEdge = minEdgeAt ? minEdgeAt(x, z, minEdge) : minEdge;
    return ed >= localMinEdge + scale * radiusFactor && ed <= maxEdge;
  });
}

function eastBeachMinEdge(x: number, z: number, base: number): number {
  const inEastBeach = x > 0.05 && x < 2.55 && z > 1.55 && z < 5.25;
  return inEastBeach ? Math.min(base, 0.025) : base;
}

function eastBeachRockMinEdge(x: number, z: number, base: number): number {
  const inEastBeach = x > 0.05 && x < 2.55 && z > 1.55 && z < 5.25;
  return inEastBeach ? Math.min(base, 0.055) : base;
}

const GRASS_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(99);
  const result: GrassPos[] = [];
  const zones = [
    // Central highlands
    { cx:  0.00, cz:  0.80, r: 2.20, n: 3500 },
    { cx: -0.20, cz:  2.00, r: 2.00, n: 3200 },
    { cx:  0.80, cz:  1.50, r: 1.50, n: 2400 },
    // Mid-hills
    { cx: -1.00, cz:  2.50, r: 1.80, n: 3000 },
    { cx:  0.50, cz:  3.00, r: 1.60, n: 2600 },
    { cx: -1.60, cz:  3.60, r: 1.40, n: 2200 },
    // Western lowlands
    { cx: -2.00, cz:  1.50, r: 1.50, n: 2400 },
    { cx: -2.30, cz:  3.00, r: 1.20, n: 1800 },
    // Southern
    { cx: -0.80, cz:  4.30, r: 1.40, n: 2100 },
    { cx:  0.50, cz:  4.00, r: 1.20, n: 1800 },
    // Eastern coast
    { cx:  1.60, cz:  0.80, r: 1.20, n: 1900 },
    { cx:  1.50, cz:  2.50, r: 1.10, n: 1600 },
    // North-central
    { cx: -0.30, cz: -1.00, r: 2.00, n: 3000 },
    { cx:  0.80, cz: -1.80, r: 1.50, n: 2200 },
    { cx: -1.50, cz: -1.50, r: 1.40, n: 2100 },
    // Northwest / northeast fill
    { cx: -2.40, cz:  0.20, r: 1.10, n: 1500 },
    { cx: -2.60, cz: -1.00, r: 1.00, n: 1300 },
    { cx:  1.20, cz: -0.60, r: 1.10, n: 1500 },
    { cx:  1.60, cz: -2.00, r: 0.90, n: 1100 },
    // Central seam fill
    { cx: -0.80, cz:  0.00, r: 1.20, n: 1700 },
    { cx:  0.40, cz: -0.20, r: 1.00, n: 1500 },
    // Far north
    { cx: -0.60, cz: -3.00, r: 1.60, n: 2000 },
    { cx: -1.20, cz: -4.50, r: 1.30, n: 1600 },
    { cx: -0.50, cz: -5.50, r: 1.00, n: 1100 },
  ];
  for (const z of zones) {
    for (let i = 0; i < z.n; i++) {
      const angle = rand() * Math.PI * 2;
      const dist  = Math.sqrt(rand()) * z.r;
      const wx = z.cx + Math.cos(angle) * dist;
      const wz = z.cz + Math.sin(angle) * dist;
      if (!pip(wx, wz)) continue;
      const ed = edgeDist(wx, wz);
      if (ed < 0.10) continue;
      // Grass thins out near the beach — smaller scale close to coast
      const coastFade = Math.min(1.0, ed / 0.35);
      const minS = 0.022 + coastFade * 0.010;
      const maxS = 0.034 + coastFade * 0.014;
      result.push([wx, sampleTerrainHeight(wx, wz), wz,
        minS + rand() * (maxS - minS),
        rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Second layer — Grass_Common_Short, offset seed so it fills gaps between the first layer
const GRASS_POSITIONS_2: GrassPos[] = (() => {
  const rand = seededRand(173);
  const result: GrassPos[] = [];
  const zones = [
    { cx:  0.00, cz:  0.80, r: 2.20, n: 2800 },
    { cx: -0.20, cz:  2.00, r: 2.00, n: 2600 },
    { cx:  0.80, cz:  1.50, r: 1.50, n: 1900 },
    { cx: -1.00, cz:  2.50, r: 1.80, n: 2400 },
    { cx:  0.50, cz:  3.00, r: 1.60, n: 2100 },
    { cx: -1.60, cz:  3.60, r: 1.40, n: 1800 },
    { cx: -2.00, cz:  1.50, r: 1.50, n: 1900 },
    { cx: -2.30, cz:  3.00, r: 1.20, n: 1500 },
    { cx: -0.80, cz:  4.30, r: 1.40, n: 1700 },
    { cx:  0.50, cz:  4.00, r: 1.20, n: 1500 },
    { cx:  1.60, cz:  0.80, r: 1.20, n: 1600 },
    { cx:  1.50, cz:  2.50, r: 1.10, n: 1300 },
    { cx: -0.30, cz: -1.00, r: 2.00, n: 2400 },
    { cx:  0.80, cz: -1.80, r: 1.50, n: 1800 },
    { cx: -1.50, cz: -1.50, r: 1.40, n: 1700 },
    { cx: -2.40, cz:  0.20, r: 1.10, n: 1200 },
    { cx: -2.60, cz: -1.00, r: 1.00, n: 1050 },
    { cx:  1.20, cz: -0.60, r: 1.10, n: 1200 },
    { cx:  1.60, cz: -2.00, r: 0.90, n:  900 },
    { cx: -0.80, cz:  0.00, r: 1.20, n: 1400 },
    { cx:  0.40, cz: -0.20, r: 1.00, n: 1200 },
    { cx: -0.60, cz: -3.00, r: 1.60, n: 1600 },
    { cx: -1.20, cz: -4.50, r: 1.30, n: 1300 },
    { cx: -0.50, cz: -5.50, r: 1.00, n:  900 },
  ];
  for (const z of zones) {
    for (let i = 0; i < z.n; i++) {
      const angle = rand() * Math.PI * 2;
      const dist  = Math.sqrt(rand()) * z.r;
      const wx = z.cx + Math.cos(angle) * dist;
      const wz = z.cz + Math.sin(angle) * dist;
      if (!pip(wx, wz)) continue;
      const ed = edgeDist(wx, wz);
      if (ed < 0.10) continue;
      const coastFade = Math.min(1.0, ed / 0.35);
      const minS = 0.020 + coastFade * 0.008;
      const maxS = 0.030 + coastFade * 0.012;
      result.push([wx, sampleTerrainHeight(wx, wz), wz,
        minS + rand() * (maxS - minS),
        rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Rock positions — scattered across highlands, mid-hills, north-central
const ROCK_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(37);
  const result: GrassPos[] = [];
  const zones = [
    { cx:  0.00, cz:  0.50, r: 2.00, n:  14 },
    { cx: -0.20, cz:  2.00, r: 1.80, n:  12 },
    { cx:  0.70, cz:  1.40, r: 1.20, n:   9 },
    { cx: -1.00, cz:  2.40, r: 1.50, n:  10 },
    { cx:  0.40, cz:  3.00, r: 1.30, n:   8 },
    { cx: -0.30, cz: -1.20, r: 1.80, n:  11 },
    { cx:  0.70, cz: -1.80, r: 1.40, n:   9 },
    { cx: -1.40, cz: -1.40, r: 1.20, n:   7 },
    { cx: -0.70, cz: -3.20, r: 1.40, n:   7 },
    { cx: -1.10, cz:  1.00, r: 1.00, n:   6 },
  ];
  for (const z of zones) {
    for (let i = 0; i < z.n; i++) {
      const angle = rand() * Math.PI * 2;
      const dist  = Math.sqrt(rand()) * z.r;
      const wx = z.cx + Math.cos(angle) * dist;
      const wz = z.cz + Math.sin(angle) * dist;
      if (!pip(wx, wz)) continue;
      if (edgeDist(wx, wz) < 0.40) continue;
      result.push([wx, sampleTerrainHeight(wx, wz), wz,
        0.038 + rand() * 0.028,
        rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Bush positions — lowlands, southern, coastal fringes
const BUSH_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(61);
  const result: GrassPos[] = [];
  const zones = [
    { cx: -2.00, cz:  1.50, r: 1.40, n: 160 },
    { cx: -2.20, cz:  2.80, r: 1.20, n: 140 },
    { cx: -1.60, cz:  0.40, r: 1.00, n: 120 },
    { cx: -0.80, cz:  4.20, r: 1.30, n: 130 },
    { cx:  0.40, cz:  3.90, r: 1.10, n: 110 },
    { cx:  1.60, cz:  0.80, r: 1.10, n: 110 },
    { cx:  1.50, cz:  2.40, r: 1.00, n: 100 },
    { cx: -0.50, cz: -1.20, r: 1.60, n: 140 },
    { cx: -1.20, cz: -4.00, r: 1.30, n: 110 },
    { cx: -0.60, cz: -5.40, r: 0.90, n:  80 },
    { cx: -0.80, cz:  0.10, r: 1.00, n: 100 },
  ];
  for (const z of zones) {
    for (let i = 0; i < z.n; i++) {
      const angle = rand() * Math.PI * 2;
      const dist  = Math.sqrt(rand()) * z.r;
      const wx = z.cx + Math.cos(angle) * dist;
      const wz = z.cz + Math.sin(angle) * dist;
      if (!pip(wx, wz)) continue;
      if (edgeDist(wx, wz) < 0.35) continue;
      result.push([wx, sampleTerrainHeight(wx, wz), wz,
        0.042 + rand() * 0.030,
        rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Coastal grass — dense golden cover over the sandy strip and immediate fringe.
const COASTAL_GRASS_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(211);
  const result: GrassPos[] = [];
  const STEP = 0.017;
  const JITTER = STEP * 0.45;
  for (let wx = -3.30; wx <= 2.90; wx += STEP) {
    for (let wz = -6.60; wz <= 5.40; wz += STEP) {
      const jx = wx + (rand() - 0.5) * JITTER * 2;
      const jz = wz + (rand() - 0.5) * JITTER * 2;
      const sc = 0.020 + rand() * 0.012;
      result.push([jx, sampleTerrainHeight(jx, jz), jz, sc, rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Extra grass-only dressing for the open east beach.
const EAST_BEACH_GRASS_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(911);
  const result: GrassPos[] = [];
  const STEP = 0.012;
  const JITTER = STEP * 0.48;
  for (let wx = 0.70; wx <= 2.35; wx += STEP) {
    for (let wz = 2.35; wz <= 5.05; wz += STEP) {
      const jx = wx + (rand() - 0.5) * JITTER * 2;
      const jz = wz + (rand() - 0.5) * JITTER * 2;
      const sc = 0.017 + rand() * 0.010;
      result.push([jx, sampleTerrainHeight(jx, jz), jz, sc, rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Extra grass-only dressing for the open southern beach.
const SOUTH_BEACH_GRASS_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(1229);
  const result: GrassPos[] = [];
  const STEP = 0.009;
  const JITTER = STEP * 0.48;
  for (let wx = -2.35; wx <= 1.55; wx += STEP) {
    for (let wz = 3.85; wz <= 5.42; wz += STEP) {
      const jx = wx + (rand() - 0.5) * JITTER * 2;
      const jz = wz + (rand() - 0.5) * JITTER * 2;
      const sc = 0.019 + rand() * 0.012;
      result.push([jx, sampleTerrainHeight(jx, jz), jz, sc, rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Extra grass-only dressing for the curved south-east beach between patches.
const SOUTH_EAST_BEACH_GRASS_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(1439);
  const result: GrassPos[] = [];
  const STEP = 0.009;
  const JITTER = STEP * 0.48;
  for (let wx = 0.45; wx <= 2.30; wx += STEP) {
    for (let wz = 3.45; wz <= 5.35; wz += STEP) {
      const jx = wx + (rand() - 0.5) * JITTER * 2;
      const jz = wz + (rand() - 0.5) * JITTER * 2;
      const sc = 0.019 + rand() * 0.012;
      result.push([jx, sampleTerrainHeight(jx, jz), jz, sc, rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Dedicated coastal rocks — bigger accents than pebbles, still clipped to land.
const COASTAL_ROCK_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(419);
  const result: GrassPos[] = [];
  const STEP = 0.12;
  const JITTER = STEP * 0.48;
  for (let wx = -3.30; wx <= 2.90; wx += STEP) {
    for (let wz = -6.60; wz <= 5.40; wz += STEP) {
      if (rand() > 0.34) continue;
      const jx = wx + (rand() - 0.5) * JITTER * 2;
      const jz = wz + (rand() - 0.5) * JITTER * 2;
      result.push([jx, sampleTerrainHeight(jx, jz), jz,
        0.018 + rand() * 0.020,
        rand() * Math.PI * 2]);
    }
  }
  return result;
})();

// Small pebbles — denser scatter in the same coastal band
const COASTAL_PEBBLE_POSITIONS: GrassPos[] = (() => {
  const rand = seededRand(317);
  const result: GrassPos[] = [];
  const STEP = 0.095;
  const JITTER = STEP * 0.5;
  for (let wx = -3.30; wx <= 2.90; wx += STEP) {
    for (let wz = -6.60; wz <= 5.40; wz += STEP) {
      if (rand() > 0.55) continue;
      const jx = wx + (rand() - 0.5) * JITTER * 2;
      const jz = wz + (rand() - 0.5) * JITTER * 2;
      result.push([jx, sampleTerrainHeight(jx, jz), jz,
        0.010 + rand() * 0.014,
        rand() * Math.PI * 2]);
    }
  }
  return result;
})();

function buildInstancedMeshes(
  scene: THREE.Group,
  positions: GrassPos[],
  dummy: THREE.Object3D
): THREE.InstancedMesh[] {
  const list: THREE.InstancedMesh[] = [];
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const m = o as THREE.Mesh;
      const im = new THREE.InstancedMesh(m.geometry, m.material, positions.length);
      im.castShadow = false;
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
    }
  });
  return list;
}

function GrassCarpet({ mask }: { mask: LandMask }) {
  // Hook calls are safe — all path arrays are module-level constants with fixed length
  const grassScenes        = ALL_GRASS_PATHS.map(p => (useGLTF(p) as GLTF).scene);
  const rockScenes         = ROCK_PATHS.map(p => (useGLTF(p) as GLTF).scene);
  const bushScenes         = BUSH_PATHS.map(p => (useGLTF(p) as GLTF).scene);
  const coastalGrassScenes = COASTAL_GRASS_PATHS.map(p => (useGLTF(p) as GLTF).scene);
  const coastalRockScenes  = COASTAL_ROCK_PATHS.map(p => (useGLTF(p) as GLTF).scene);
  const pebbleScenes       = PEBBLE_PATHS.map(p => (useGLTF(p) as GLTF).scene);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const allPos = useMemo(() => filterByMask(
    [...GRASS_POSITIONS, ...GRASS_POSITIONS_2],
    mask,
    EDGE_BUFFER.grass,
    Infinity,
    2.4
  ), [mask]);
  const rockPos = useMemo(() => filterByMask(ROCK_POSITIONS, mask, EDGE_BUFFER.rock, Infinity, 3.0), [mask]);
  const bushPos = useMemo(() => filterByMask(BUSH_POSITIONS, mask, EDGE_BUFFER.bush, Infinity, 2.6), [mask]);
  const coastalGrassPos = useMemo(() => filterByMask(
    [
      ...COASTAL_GRASS_POSITIONS,
      ...EAST_BEACH_GRASS_POSITIONS,
      ...SOUTH_BEACH_GRASS_POSITIONS,
      ...SOUTH_EAST_BEACH_GRASS_POSITIONS,
    ],
    mask,
    EDGE_BUFFER.coastalMin,
    EDGE_BUFFER.coastalMax,
    2.2,
    eastBeachMinEdge
  ), [mask]);
  const coastalRockPos = useMemo(() => filterByMask(
    COASTAL_ROCK_POSITIONS,
    mask,
    EDGE_BUFFER.coastalRockMin,
    EDGE_BUFFER.coastalRockMax,
    2.8,
    eastBeachRockMinEdge
  ), [mask]);
  const coastalPebblePos = useMemo(() => filterByMask(
    COASTAL_PEBBLE_POSITIONS,
    mask,
    EDGE_BUFFER.coastalMin,
    EDGE_BUFFER.coastalMax,
    1.4,
    eastBeachMinEdge
  ), [mask]);

  const grassChunks = useMemo(() => {
    const n = grassScenes.length;
    return grassScenes.map((_, vi) => allPos.filter((_, i) => i % n === vi));
  }, [grassScenes, allPos]);

  const rockChunks = useMemo(() => {
    const n = rockScenes.length;
    return rockScenes.map((_, vi) => rockPos.filter((_, i) => i % n === vi));
  }, [rockScenes, rockPos]);

  const bushChunks = useMemo(() => {
    const n = bushScenes.length;
    return bushScenes.map((_, vi) => bushPos.filter((_, i) => i % n === vi));
  }, [bushScenes, bushPos]);

  const coastalChunks = useMemo(() => {
    const n = coastalGrassScenes.length;
    return coastalGrassScenes.map((_, vi) => coastalGrassPos.filter((_, i) => i % n === vi));
  }, [coastalGrassScenes, coastalGrassPos]);

  const coastalRockChunks = useMemo(() => {
    const n = coastalRockScenes.length;
    return coastalRockScenes.map((_, vi) => coastalRockPos.filter((_, i) => i % n === vi));
  }, [coastalRockScenes, coastalRockPos]);

  const pebbleChunks = useMemo(() => {
    const n = pebbleScenes.length;
    return pebbleScenes.map((_, vi) => coastalPebblePos.filter((_, i) => i % n === vi));
  }, [pebbleScenes, coastalPebblePos]);

  const all = useMemo(() => [
    ...grassScenes.flatMap((s, vi)        => buildInstancedMeshes(s, grassChunks[vi],   dummy)),
    ...rockScenes.flatMap((s, vi)         => buildInstancedMeshes(s, rockChunks[vi],    dummy)),
    ...bushScenes.flatMap((s, vi)         => buildInstancedMeshes(s, bushChunks[vi],    dummy)),
    ...coastalGrassScenes.flatMap((s, vi) => buildInstancedMeshes(s, coastalChunks[vi], dummy)),
    ...coastalRockScenes.flatMap((s, vi)  => buildInstancedMeshes(s, coastalRockChunks[vi], dummy)),
    ...pebbleScenes.flatMap((s, vi)       => buildInstancedMeshes(s, pebbleChunks[vi],  dummy)),
  ], [grassScenes, rockScenes, bushScenes, coastalGrassScenes, coastalRockScenes, pebbleScenes,
      dummy, grassChunks, rockChunks, bushChunks, coastalChunks, coastalRockChunks, pebbleChunks]);

  useEffect(() => { return () => { all.forEach(im => im.dispose()); }; }, [all]);

  return <>{all.map((im, i) => <primitive key={i} object={im} />)}</>;
}

function CommonTreeInstance({ idx, x, y, z, scale, rot }: { idx: number; x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(COMMON_TREES[idx]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow receiveShadow />;
}
function PineInstance({ idx, x, y, z, scale, rot }: { idx: number; x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(PINES[idx]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow receiveShadow />;
}
function TwistedInstance({ idx, x, y, z, scale, rot }: { idx: number; x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(TWISTED[idx]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow />;
}
function RockInstance({ idx, x, y, z, scale, rot }: { idx: number; x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(ROCKS[idx]) as GLTF;
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow receiveShadow />;
}
function BushInstance({ x, y, z, scale, rot }: { x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(BUSHES[0]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow />;
}
function FlowerInstance({ x, y, z, scale, rot }: { x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(FLOWERS[0]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow />;
}
function FernInstance({ x, y, z, scale, rot }: { x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(FERNS[0]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow />;
}
function GrassInstance({ idx, x, y, z, scale, rot }: { idx: number; x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(GRASSES[idx]) as GLTF;
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} />;
}
function DeadTreeInstance({ idx, x, y, z, scale, rot }: { idx: number; x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(DEAD_TREES[idx]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow />;
}
function FlowerGroupInstance({ idx, x, y, z, scale, rot }: { idx: number; x: number; y: number; z: number; scale: number; rot: number }) {
  const { scene } = useGLTF(FLOWER_GROUPS[idx]) as GLTF;
  useMemo(() => patchWindSway(scene), [scene]);
  return <Clone object={scene} position={[x, y, z]} scale={scale} rotation={[0, rot, 0]} castShadow />;
}

export default function MapVegetation() {
  const svgData = useLoader(SVGLoader, "/lk.svg");
  const mask = useMemo(() => buildLandMask(svgData), [svgData]);
  useFrame(({ clock }) => { windUniforms.uTime.value = clock.getElapsedTime(); });
  const assets = useMemo(() => PLACEMENTS.filter((a) =>
    mask.contains(a.x, a.z) && mask.edgeDistance(a.x, a.z) >= EDGE_BUFFER.asset + a.scale * 3.2
  ), [mask]);

  return (
    <group>
      <GrassCarpet mask={mask} />
      {assets.map((a, i) => {
        const props = { idx: a.modelIdx, x: a.x, y: a.y, z: a.z, scale: a.scale, rot: a.rot };
        switch (a.modelSet) {
          case "common":      return <CommonTreeInstance  key={i} {...props} />;
          case "pine":        return <PineInstance        key={i} {...props} />;
          case "twisted":     return <TwistedInstance     key={i} {...props} />;
          case "rock":        return <RockInstance        key={i} {...props} />;
          case "bush":        return <BushInstance        key={i} {...props} />;
          case "flower":      return <FlowerInstance      key={i} {...props} />;
          case "fern":        return <FernInstance        key={i} {...props} />;
          case "dead":        return <DeadTreeInstance    key={i} {...props} />;
          case "flowergroup": return <FlowerGroupInstance key={i} {...props} />;
        }
      })}
    </group>
  );
}
