"use client";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ISLAND_POLY } from "@/lib/terrain";

const POLY_COUNT = ISLAND_POLY.length;

const vert = /* glsl */`
uniform float uTime;
varying float vHeight;
varying vec3  vNormal;
varying vec3  vPos;

// Gerstner (trochoidal) wave — horizontal + vertical displacement.
// Using explicit speed instead of sqrt(9.8/k) to keep motion calm at scene scale.
vec3 gerstner(vec3 p, vec2 dir, float amp, float wavelength, float speed) {
  float k = 6.28318 / wavelength;
  vec2  d = normalize(dir);
  float f = k * dot(d, p.xz) - speed * uTime;
  float q = 0.5; // steepness [0-1]

  return vec3(
    d.x * q * amp * cos(f),
    amp * sin(f),
    d.y * q * amp * cos(f)
  );
}

vec3 displace(vec3 p) {
  vec3 w = vec3(0.0);
  w += gerstner(p, vec2( 0.0, -1.0), 0.06, 7.0, 0.8);
  w += gerstner(p, vec2( 0.0,  1.0), 0.035, 4.0, 1.1);
  w += gerstner(p, vec2( 1.0,  0.8), 0.020, 2.5, 1.4);
  w += gerstner(p, vec2(-0.8,  0.6), 0.015, 3.5, 0.9);
  return p + w;
}

vec3 orthogonal(vec3 v) {
  return normalize(
    abs(v.x) > abs(v.z)
      ? vec3(-v.y, v.x, 0.0)
      : vec3(0.0, -v.z, v.y)
  );
}

void main() {
  vec3 newPos = displace(position);
  vHeight = newPos.y - position.y;

  float eps   = 0.10;
  vec3  tang  = orthogonal(normal);
  vec3  bitan = normalize(cross(normal, tang));
  vec3  n1    = displace(position + tang  * eps);
  vec3  n2    = displace(position + bitan * eps);
  vNormal = normalize(cross(n1 - newPos, n2 - newPos));

  vPos        = (modelMatrix * vec4(newPos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const frag = /* glsl */`
#define POLY_COUNT ${POLY_COUNT}

uniform vec3  uWaterColor;
uniform vec3  uWaterHighlight;
uniform vec3  uSunDir;
uniform vec2  uIslandPoly[POLY_COUNT];

varying float vHeight;
varying vec3  vNormal;
varying vec3  vPos;

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2  ab = b - a;
  float t  = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.000001), 0.0, 1.0);
  return length(p - (a + ab * t));
}

float coastDistance(vec2 p) {
  float d = 9999.0;
  for (int i = 0; i < POLY_COUNT; i++) {
    int j = i == 0 ? POLY_COUNT - 1 : i - 1;
    d = min(d, segmentDistance(p, uIslandPoly[j], uIslandPoly[i]));
  }
  return d;
}

bool pointInIsland(vec2 p) {
  bool inside = false;
  for (int i = 0, j = POLY_COUNT - 1; i < POLY_COUNT; j = i++) {
    vec2 a = uIslandPoly[i];
    vec2 b = uIslandPoly[j];
    float denom = abs(b.y - a.y) < 0.000001 ? 0.000001 : b.y - a.y;
    bool crosses = ((a.y > p.y) != (b.y > p.y)) &&
      (p.x < (b.x - a.x) * (p.y - a.y) / denom + a.x);
    if (crosses) inside = !inside;
  }
  return inside;
}

float yalaShoreBlend(vec2 p) {
  // Rounded-rectangle SDF — h = inner half-extents, r = corner radius
  vec2  c = vec2(1.20, 2.70);
  vec2  h = vec2(0.85, 1.50);
  float r = 0.80;
  vec2  q = abs(p - c) - h;
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  return 1.0 - smoothstep(-0.20, 1.60, dist);
}

void main() {
  vec2 waterXZ = vPos.xz;
  if (pointInIsland(waterXZ)) discard;

  float coast = coastDistance(waterXZ);
  float yalaBlend = yalaShoreBlend(waterXZ);
  float shallowReach = mix(1.45, 4.85, yalaBlend);
  float shallow = 1.0 - smoothstep(0.18, shallowReach, coast);
  // beachWash (sandy shore lines) suppressed inside the Yala shallow zone
  float beachWash = (1.0 - smoothstep(0.04, 0.42, coast)) * (1.0 - yalaBlend);

  // Height → colour: crests lighten toward highlight, troughs stay deep blue.
  float t   = clamp(vHeight * 8.0 + 0.25, 0.0, 1.0);
  vec3  deepCol = mix(uWaterColor, uWaterHighlight, t);
  vec3  shallowCol = mix(vec3(0.18, 0.62, 0.58), vec3(0.56, 0.82, 0.68), t);
  vec3  col = mix(deepCol, shallowCol, shallow);

  // Half-Lambert diffuse so the base stays bright (no pitch-black undersides).
  vec3  N    = normalize(vNormal);
  vec3  L    = normalize(uSunDir);
  float diff = dot(N, L) * 0.45 + 0.55;
  col *= diff;

  // Blinn-Phong specular sun glint.
  vec3  V    = normalize(cameraPosition - vPos);
  vec3  H    = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 80.0) * 0.50;
  col += vec3(1.0) * spec;

  float shoreLines = smoothstep(0.92, 1.0, sin(coast * 28.0 - vPos.x * 2.4 + vHeight * 9.0) * 0.5 + 0.5);
  col += vec3(0.86, 0.94, 0.82) * shoreLines * beachWash * 0.20;

  float alpha = mix(0.93, 0.58, shallow) + beachWash * 0.08;
  gl_FragColor = vec4(col, clamp(alpha, 0.52, 0.96));
}
`;

export default function OceanPlane() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(160, 160, 180, 180);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   vert,
        fragmentShader: frag,
        uniforms: {
          uTime:          { value: 0 },
          uSunDir:        { value: new THREE.Vector3(-5, 28, 2).normalize() },
          uWaterColor:    { value: new THREE.Color(0x003388) },
          uWaterHighlight:{ value: new THREE.Color(0x1166cc) },
          uIslandPoly:     { value: ISLAND_POLY.map(([x, z]) => new THREE.Vector2(x, z)) },
        },
        transparent: true,
        side: THREE.FrontSide,
      }),
    []
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh geometry={geometry} material={material} position={[0, -0.32, 0]} />
  );
}
