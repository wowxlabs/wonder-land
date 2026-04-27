import { Vector3 } from "three";

export class BoidVector {
  x: number; y: number; z: number; w?: number;

  constructor(v: { x: number; y: number; z: number; w?: number }) {
    this.x = v.x; this.y = v.y; this.z = v.z; this.w = v.w;
  }

  add(v: BoidVector)  { this.x += v.x; this.y += v.y; this.z += v.z; }
  addX(x: number)     { this.x += x; }
  addY(y: number)     { this.y += y; }
  addZ(z: number)     { this.z += z; }
  setX(x: number)     { this.x = x; }
  setY(y: number)     { this.y = y; }
  setZ(z: number)     { this.z = z; }

  diff(v: BoidVector): BoidVector {
    return new BoidVector({ x: this.x - v.x, y: this.y - v.y, z: this.z - v.z });
  }
  sum(v: BoidVector): BoidVector {
    return new BoidVector({ x: this.x + v.x, y: this.y + v.y, z: this.z + v.z });
  }
  div(n: number): BoidVector {
    return new BoidVector({ x: this.x / n, y: this.y / n, z: this.z / n });
  }
  prod(n: number): BoidVector {
    return new BoidVector({ x: this.x * n, y: this.y * n, z: this.z * n });
  }
  distanceTo(v: BoidVector): number {
    return Math.sqrt((v.x-this.x)**2 + (v.y-this.y)**2 + (v.z-this.z)**2);
  }
  v3(): Vector3 { return new Vector3(this.x, this.y, this.z); }
}
