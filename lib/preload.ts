import { useGLTF } from "@react-three/drei";

export function idlePreload(paths: string[]): void {
  const run = () => paths.forEach(p => useGLTF.preload(p));
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 100);
  }
}
