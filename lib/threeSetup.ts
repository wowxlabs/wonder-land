import * as THREE from "three";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

if (typeof window !== "undefined" && BASE) {
  THREE.DefaultLoadingManager.setURLModifier((url) => {
    if (url.startsWith("/") && !url.startsWith("//")) {
      return BASE + url;
    }
    return url;
  });
}
