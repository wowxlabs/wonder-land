"use client";
import { useMemo, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { fbm, edgeDist, maxHeightAt, pip, sampleTerrainHeight, yalaShoreBlend } from "@/lib/terrain";

const DISTRICT_DATA: Record<string, { color: string; depth: number }> = {
  LK23: { color: "#c8e84c", depth: 36 }, // Nuwara Eliya  — bright lime
  LK21: { color: "#a0d840", depth: 28 }, // Kandy         — warm green
  LK81: { color: "#80c438", depth: 24 }, // Badulla
  LK91: { color: "#68b830", depth: 18 }, // Ratnapura
  LK92: { color: "#58ac2c", depth: 15 }, // Kegalle
  LK22: { color: "#50a428", depth: 12 }, // Matale
  LK13: { color: "#4cb840", depth: 11 }, // Kalutara      — rich forest green
  LK11: { color: "#48b43c", depth: 11 }, // Colombo
  LK12: { color: "#4ab63e", depth: 11 }, // Gampaha
  LK31: { color: "#44b03c", depth: 11 }, // Galle
  LK32: { color: "#40ac38", depth: 11 }, // Matara
  LK61: { color: "#5cb440", depth: 10 }, // Kurunegala
  LK82: { color: "#68a43c", depth: 10 }, // Monaragala
  LK45: { color: "#60ac3c", depth: 10 }, // Mullaitivu
  LK51: { color: "#68a840", depth: 10 }, // Batticaloa
  LK52: { color: "#70ac44", depth: 10 }, // Ampara
  LK53: { color: "#84b048", depth: 10 }, // Trincomalee
  LK72: { color: "#8eb04c", depth: 10 }, // Polonnaruwa
  LK71: { color: "#98b850", depth: 10 }, // Anuradhapura
  LK62: { color: "#9cbc54", depth: 10 }, // Puttalam
  LK44: { color: "#90b048", depth: 10 }, // Vavuniya
  LK42: { color: "#bcb85c", depth: 10 }, // Kilinochchi   — drier, golden
  LK43: { color: "#ccc460", depth: 10 }, // Mannar
  LK41: { color: "#d4cc68", depth: 10 }, // Jaffna        — warm golden dry
  LK33: { color: "#bcac54", depth: 10 }, // Hambantota
};

const SVG_CX = 509, SVG_CY = 525, SVG_SCALE = 0.013;

function svgToWorld(sx: number, sy: number): [number, number] {
  return [(sx - SVG_CX) * SVG_SCALE, (sy - SVG_CY) * SVG_SCALE];
}
function hexToRGB(h: string): [number, number, number] {
  return [parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255, parseInt(h.slice(5,7),16)/255];
}
function pipXZ(wx: number, wz: number, poly: [number,number][]): boolean {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n-1; i < n; j = i++) {
    const [xi,zi] = poly[i], [xj,zj] = poly[j];
    if ((zi > wz) !== (zj > wz) && wx < (xj-xi)*(wz-zi)/(zj-zi)+xi) inside = !inside;
  }
  return inside;
}
function edgeDistToPoly(wx: number, wz: number, poly: [number,number][]): number {
  let min = Infinity;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [ax, az] = poly[j], [bx, bz] = poly[i];
    const dx = bx - ax, dz = bz - az;
    const denom = dx * dx + dz * dz;
    const t = denom < 1e-12 ? 0 : Math.max(0, Math.min(1, ((wx - ax) * dx + (wz - az) * dz) / denom));
    const d = Math.hypot(wx - ax - t * dx, wz - az - t * dz);
    if (d < min) min = d;
  }
  return min;
}

interface DistrictEntry {
  rgb: [number,number,number];
  maxH: number;
  poly: [number,number][];
  minX: number; maxX: number; minZ: number; maxZ: number;
}

const PLANE_W = 9, PLANE_H = 15;
const SEGS_X = 220, SEGS_Z = 330;
const VX = SEGS_X + 1, VZ = SEGS_Z + 1;
const COAST_FADE = 0.35;
const BEACH_RGB: [number,number,number] = [0.784, 0.686, 0.376];
const WET_SAND_RGB: [number,number,number] = [0.62, 0.72, 0.48];
const REEF_RGB: [number,number,number] = [0.28, 0.58, 0.48];
const FALLBACK_RGB: [number,number,number] = [0.35, 0.62, 0.28];
const SHORE_SHELF = 0.95;

export default function SriLankaIsland() {
  const svgData = useLoader(SVGLoader, "/lk.svg");

  const districts = useMemo<DistrictEntry[]>(() => {
    const result: DistrictEntry[] = [];
    for (const path of svgData.paths) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node = (path.userData as any)?.node as Element | undefined;
      if (!node || node.tagName === "circle") continue;
      const id = node.id || node.getAttribute?.("id") || "";
      const data = DISTRICT_DATA[id];
      if (!data) continue;
      const shapes = SVGLoader.createShapes(path);
      for (const shape of shapes) {
        const pts = shape.getPoints(120);
        const poly: [number,number][] = pts.map(p => svgToWorld(p.x, p.y));
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (const [x,z] of poly) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
        }
        result.push({ rgb: hexToRGB(data.color), maxH: data.depth * SVG_SCALE, poly, minX, maxX, minZ, maxZ });
      }
    }
    return result;
  }, [svgData]);

  const geo = useMemo(() => {
    const N = VX * VZ;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const uv  = new Float32Array(N * 2);

    for (let iz = 0; iz < VZ; iz++) {
      for (let ix = 0; ix < VX; ix++) {
        const idx = iz * VX + ix;
        const wx = -PLANE_W/2 + (ix/SEGS_X) * PLANE_W;
        const wz = -PLANE_H/2 + (iz/SEGS_Z) * PLANE_H;

        let wy = -0.5;
        let [cr, cg, cb] = FALLBACK_RGB;

        // Use actual SVG district polygons as island mask — exact SVG shape
        let distRGB: [number,number,number] | null = null;
        let distMaxH = 0.13;
        let svgEdgeDist = Infinity;
        const yalaBlend = yalaShoreBlend(wx, wz);
        const yalaShelfWidth = SHORE_SHELF + yalaBlend * 2.85;
        for (const d of districts) {
          const closeToYalaShelf = yalaBlend > 0.01 &&
            wx >= d.minX - yalaShelfWidth && wx <= d.maxX + yalaShelfWidth &&
            wz >= d.minZ - yalaShelfWidth && wz <= d.maxZ + yalaShelfWidth;

          if (closeToYalaShelf) {
            svgEdgeDist = Math.min(svgEdgeDist, edgeDistToPoly(wx, wz, d.poly));
          }

          if (wx < d.minX || wx > d.maxX || wz < d.minZ || wz > d.maxZ) continue;
          if (pipXZ(wx, wz, d.poly)) { distRGB = d.rgb; distMaxH = d.maxH; break; }
        }

        if (distRGB) {
          const ed = edgeDist(wx, wz);
          const regularFade = Math.min(1.0, ed / COAST_FADE);
          const yalaFade = Math.min(1.0, ed / 2.65);
          const coastFade = regularFade * (1 - yalaBlend) + yalaFade * yalaBlend;
          const maxH = maxHeightAt(wx, wz);

          const n1 = fbm(wx * 1.8 + 7.31, wz * 1.8 + 13.17, 6);
          const n2 = fbm(wx * 4.6 + 50.9, wz * 4.6 + 37.3,  3) * 0.12;
          wy = Math.max(0, (n1 * 0.88 + n2) * maxH * coastFade);
          if (yalaBlend > 0) {
            const yalaCap = Math.pow(Math.min(1, ed / 2.35), 1.35) * 0.10;
            wy = Math.min(wy, wy * (1 - yalaBlend) + yalaCap * yalaBlend);
          }

          {

            [cr, cg, cb] = distRGB;
            // Darken peaks slightly
            const peakT = Math.max(0, wy / distMaxH - 0.5) * 0.45;
            cr = Math.max(0, cr - peakT);
            cg = Math.max(0, cg - peakT * 0.9);
            cb = Math.max(0, cb - peakT * 0.7);
          }

          // Sandy beach near coastline
          const ed2 = edgeDist(wx, wz);
          const beachBlend = Math.max(0, 1 - ed2 / 0.28) * 0.78;
          if (beachBlend > 0) {
            cr += (BEACH_RGB[0] - cr) * beachBlend;
            cg += (BEACH_RGB[1] - cg) * beachBlend;
            cb += (BEACH_RGB[2] - cb) * beachBlend;
          }

          // Subtle jitter
          const jitter = (fbm(wx*9.1+3.7, wz*9.1+8.4, 2) - 0.5) * 0.022;
          cr = Math.min(1, Math.max(0, cr + jitter));
          cg = Math.min(1, Math.max(0, cg + jitter * 0.85));
          cb = Math.min(1, Math.max(0, cb + jitter * 0.4));
        } else {
          const ed = edgeDist(wx, wz);
          const shelfDist = yalaBlend > 0.01 ? svgEdgeDist : ed;
          const shelfWidth = yalaBlend > 0.01 ? yalaShelfWidth : SHORE_SHELF;
          if ((yalaBlend > 0.01 || !pip(wx, wz)) && shelfDist < shelfWidth) {
            const shelfT = Math.max(0, Math.min(1, shelfDist / shelfWidth));
            const ripple = (fbm(wx * 5.6 + 18.2, wz * 5.6 + 41.7, 4) - 0.5) * 0.045;
            wy = -0.04 - Math.pow(shelfT, 1.45) * 0.42 + ripple * (1 - shelfT);

            const sandT = Math.max(0, 1 - shelfDist / 0.42);
            const reefT = Math.max(0, Math.min(1, (shelfDist - 0.18) / 0.62));
            cr = BEACH_RGB[0] * sandT + (WET_SAND_RGB[0] * (1 - reefT) + REEF_RGB[0] * reefT) * (1 - sandT);
            cg = BEACH_RGB[1] * sandT + (WET_SAND_RGB[1] * (1 - reefT) + REEF_RGB[1] * reefT) * (1 - sandT);
            cb = BEACH_RGB[2] * sandT + (WET_SAND_RGB[2] * (1 - reefT) + REEF_RGB[2] * reefT) * (1 - sandT);
          }
        }

        pos[idx*3]=wx; pos[idx*3+1]=wy; pos[idx*3+2]=wz;
        col[idx*3]=cr; col[idx*3+1]=cg; col[idx*3+2]=cb;
        uv[idx*2]=ix/SEGS_X; uv[idx*2+1]=iz/SEGS_Z;
      }
    }

    const idxBuf = new Uint32Array(SEGS_X * SEGS_Z * 6);
    let p = 0;
    for (let iz = 0; iz < SEGS_Z; iz++) {
      for (let ix = 0; ix < SEGS_X; ix++) {
        const a = iz*VX+ix, b = a+1, c = (iz+1)*VX+ix, d = c+1;
        idxBuf[p++]=a; idxBuf[p++]=c; idxBuf[p++]=b;
        idxBuf[p++]=b; idxBuf[p++]=c; idxBuf[p++]=d;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    g.setAttribute("uv",       new THREE.BufferAttribute(uv,  2));
    g.setIndex(new THREE.BufferAttribute(idxBuf, 1));
    g.computeVertexNormals();
    return g;
  }, [districts]);

  useEffect(() => () => { geo.dispose(); }, [geo]);

  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0.0} flatShading={false} />
    </mesh>
  );
}

export { sampleTerrainHeight };
