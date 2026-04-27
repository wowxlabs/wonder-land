import { BoidVector } from "./BoidVector";

export class BoidBird {
  pos:       BoidVector;
  vel:       BoidVector;
  bias:      number;
  id:        number;
  flapOffset:number;

  constructor(p: {
    pos: BoidVector; vel: BoidVector;
    bias: number; id: number; flapOffset: number;
  }) {
    this.pos = p.pos; this.vel = p.vel;
    this.bias = p.bias; this.id = p.id; this.flapOffset = p.flapOffset;
  }

  incremVXYZ(v: BoidVector) { this.vel.add(v); }
  incremVX(vx: number)      { this.vel.addX(vx); }
  incremVY(vy: number)      { this.vel.addY(vy); }
  incremVZ(vz: number)      { this.vel.addZ(vz); }
  setVX(vx: number)         { this.vel.setX(vx); }
  setVXYZ(v: BoidVector)    { this.vel = new BoidVector({ x: v.x, y: v.y, z: v.z }); }
  setBias(b: number)        { this.bias = b; }

  move(delta: number): void {
    this.pos.add(this.vel.prod(delta));
  }

  getSpeed(): number {
    return Math.sqrt(this.vel.x**2 + this.vel.y**2 + this.vel.z**2);
  }

  getGrid(maxRange: number): number[] {
    return [
      Math.floor(this.pos.x / maxRange) * maxRange,
      Math.floor(this.pos.y / maxRange) * maxRange,
      Math.floor(this.pos.z / maxRange) * maxRange,
    ];
  }

  getNeighbors(maxRange: number): string[] {
    const g = this.getGrid(maxRange);
    const [gx, gy, gz] = g;
    const nx = this.pos.x < gx + maxRange / 2 ? gx - maxRange : gx + maxRange;
    const ny = this.pos.y < gy + maxRange / 2 ? gy - maxRange : gy + maxRange;
    const nz = this.pos.z < gz + maxRange / 2 ? gz - maxRange : gz + maxRange;
    return [
      JSON.stringify([gx,  ny, gz]),
      JSON.stringify([gx,  ny, nz]),
      JSON.stringify([gx,  gy, gz]),
      JSON.stringify([gx,  gy, nz]),
      JSON.stringify([nx,  ny, gz]),
      JSON.stringify([nx,  ny, nz]),
      JSON.stringify([nx,  gy, gz]),
      JSON.stringify([nx,  gy, nz]),
    ];
  }

  inBiasGroup1(n: number): boolean { return this.id < n / 5; }
  inBiasGroup2(n: number): boolean { return this.id > n / 5 && this.id < (2 * n) / 5; }

  wingAnimation(time: number): number {
    return Math.sin((time * 7 + Math.PI / 2) * 2 + this.flapOffset) * 0.75;
  }
}
