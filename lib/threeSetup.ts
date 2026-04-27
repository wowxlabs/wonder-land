import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

if (typeof window !== "undefined") {
  if (BASE) {
    THREE.DefaultLoadingManager.setURLModifier((url) => {
      if (url.startsWith("/") && !url.startsWith("//")) {
        return BASE + url;
      }
      return url;
    });
  }

  useGLTF.setDecoderPath("/draco/");
}
