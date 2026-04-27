// ── Value Noise ───────────────────────────────────────────────────────────────
function h2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function s5(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function vnoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = s5(fx), uy = s5(fy);
  return (
    h2(ix,   iy  ) * (1 - ux) * (1 - uy) +
    h2(ix+1, iy  ) * ux       * (1 - uy) +
    h2(ix,   iy+1) * (1 - ux) * uy       +
    h2(ix+1, iy+1) * ux       * uy
  );
}
export function fbm(x: number, y: number, octs = 6): number {
  let v = 0, amp = 0.5, freq = 1, tot = 0;
  for (let i = 0; i < octs; i++) {
    v   += amp * vnoise(x * freq, y * freq);
    tot += amp;
    amp  *= 0.5;
    freq *= 2.1;
  }
  return v / tot;
}

// ── Island Outline Polygon [x, z] world-space ─────────────────────────────────
// Key geographic points converted: World_x = (lon − 80.885) × 2.995
//                                  World_z = −(lat − 7.681) × 3.032
export const ISLAND_POLY: [number, number][] = [
  [-0.85,  5.30],  // Dondra Head (southernmost)
  [-1.50,  5.10],
  [-2.20,  4.30],  // Galle area
  [-2.70,  3.40],
  [-3.00,  2.20],  // Colombo south
  [-3.15,  1.10],  // Colombo
  [-3.20,  0.00],  // Negombo
  [-3.10, -1.00],  // Chilaw
  [-3.00, -2.00],  // Puttalam
  [-2.55, -3.10],  // Mannar approach
  [-2.00, -4.00],  // Mannar
  [-1.65, -5.40],  // Jaffna south
  [-2.00, -6.20],  // Jaffna west
  [-1.10, -6.50],  // Point Pedro (northernmost)
  [-0.40, -6.00],  // Jaffna east (tightened — prevents peninsula over-inclusion)
  [-0.10, -5.50],  // Palk Strait buffer
  [ 0.15, -5.00],  // Palk Bay
  [ 0.55, -4.35],  // Mullaitivu coast
  [ 0.90, -3.70],  // Trincomalee approach
  [ 1.10, -2.80],  // Trincomalee
  [ 1.90, -1.80],  // NE coast
  [ 2.50, -0.40],  // Sangamankanda (pulled in to match terrain mesh extent)
  [ 2.40,  0.50],  // coast between Sangamankanda and Batticaloa
  [ 2.30,  0.80],  // Batticaloa (pulled in)
  [ 2.10,  2.40],  // Ampara
  [ 1.60,  3.80],  // SE coast
  [ 0.90,  4.90],  // Hambantota
  [ 0.10,  5.30],  // SE tip
  [-0.85,  5.30],  // close
];

export function pip(px: number, pz: number): boolean {
  let inside = false;
  const n = ISLAND_POLY.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, zi] = ISLAND_POLY[i];
    const [xj, zj] = ISLAND_POLY[j];
    if ((zi > pz) !== (zj > pz) && px < (xj - xi) * (pz - zi) / (zj - zi) + xi)
      inside = !inside;
  }
  return inside;
}

export function edgeDist(px: number, pz: number): number {
  let min = Infinity;
  const n = ISLAND_POLY.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [ax, az] = ISLAND_POLY[j], [bx, bz] = ISLAND_POLY[i];
    const dx = bx - ax, dz = bz - az;
    const denom = dx * dx + dz * dz;
    const t = denom < 1e-12 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / denom));
    const d = Math.hypot(px - ax - t * dx, pz - az - t * dz);
    if (d < min) min = d;
  }
  return min;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function yalaShoreBlend(x: number, z: number): number {
  const cx = 1.20, cz = 2.70;
  const hx = 0.85, hz = 1.50;
  const r  = 0.80;
  const qx = Math.abs(x - cx) - hx;
  const qz = Math.abs(z - cz) - hz;
  const dist = Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - r;
  return 1 - smoothstep(-0.20, 1.60, dist);
}

// ── Terrain height profile ────────────────────────────────────────────────────
// Defines the maximum possible height at (x,z), reflecting real geography.
export function maxHeightAt(x: number, z: number): number {
  const regions = [
    // Central highlands — tallest
    { cx: -0.25, cz:  0.30, r: 2.2, h: 1.80 },  // Kandy / central core
    { cx: -0.10, cz:  2.10, r: 1.5, h: 2.20 },  // Nuwara Eliya (highest)
    { cx:  0.75, cz:  2.20, r: 1.0, h: 1.60 },  // Badulla
    { cx:  0.40, cz:  1.00, r: 0.8, h: 1.10 },  // Knuckles range
    { cx: -1.10, cz:  2.60, r: 1.3, h: 1.00 },  // Ratnapura hills
    { cx: -0.10, cz: -0.45, r: 1.0, h: 0.65 },  // Central ridge / Sigiriya area
    { cx: -1.70, cz:  3.60, r: 0.9, h: 0.55 },  // Kegalle
    { cx: -2.20, cz:  1.80, r: 0.7, h: 0.22 },  // SW coast gentle hills
  ];
  let maxH = 0.10; // flat lowland baseline
  for (const r of regions) {
    const d = Math.hypot(x - r.cx, z - r.cz) / r.r;
    if (d < 1.0) {
      const influence = Math.pow(1.0 - d * d, 1.5);
      const candidate = r.h * influence + 0.08;
      if (candidate > maxH) maxH = candidate;
    }
  }
  return maxH;
}

export function sampleTerrainHeight(x: number, z: number): number {
  if (!pip(x, z)) return 0;
  const ed = edgeDist(x, z);
  const yalaBlend = yalaShoreBlend(x, z);
  const regularFade = Math.min(1.0, ed / 0.35);
  const yalaFade = Math.min(1.0, ed / 2.65);
  const coastFade = regularFade * (1 - yalaBlend) + yalaFade * yalaBlend;
  const maxH = maxHeightAt(x, z);
  const n1 = fbm(x * 1.8 + 7.31, z * 1.8 + 13.17, 6);
  const n2 = fbm(x * 4.6 + 50.9, z * 4.6 + 37.3,  3) * 0.12;
  const height = Math.max(0, (n1 * 0.88 + n2) * maxH * coastFade);
  const yalaCap = Math.pow(Math.min(1, ed / 2.35), 1.35) * 0.10;
  return yalaBlend > 0 ? Math.min(height, height * (1 - yalaBlend) + yalaCap * yalaBlend) : height;
}

// ── Height → color gradient stops ────────────────────────────────────────────
// Base colour from elevation; beach sand applied separately via edgeDist blend.
const GRADIENT = [
  { at: 0.000, r: 0.490, g: 0.784, b: 0.408 },  // #7dc868  lowland green
  { at: 0.180, r: 0.290, g: 0.565, b: 0.251 },  // #4a9040  lowland forest
  { at: 0.380, r: 0.165, g: 0.471, b: 0.220 },  // #2a7838  mid elevation
  { at: 0.580, r: 0.110, g: 0.369, b: 0.157 },  // #1c5e28  highland forest
  { at: 0.780, r: 0.078, g: 0.267, b: 0.110 },  // #144520  upper highland
  { at: 1.000, r: 0.294, g: 0.251, b: 0.220 },  // #4b4038  rocky summit
] as const;

export const BEACH_RGB: [number, number, number] = [0.784, 0.686, 0.376]; // #c8ae60

export function heightToRGB(h: number, globalMax = 1.2): [number, number, number] {
  const t = Math.min(1.0, Math.max(0.0, h / globalMax));
  for (let i = 1; i < GRADIENT.length; i++) {
    if (t <= GRADIENT[i].at) {
      const a = GRADIENT[i - 1], b = GRADIENT[i];
      const frac = (b.at - a.at) < 1e-9 ? 0 : (t - a.at) / (b.at - a.at);
      return [
        a.r + (b.r - a.r) * frac,
        a.g + (b.g - a.g) * frac,
        a.b + (b.b - a.b) * frac,
      ];
    }
  }
  const last = GRADIENT[GRADIENT.length - 1];
  return [last.r, last.g, last.b];
}
