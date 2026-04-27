"use client";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import * as THREE from "three";

interface Props {
  target: THREE.Vector3;
  position: THREE.Vector3;
  enableOrbit?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orbitRef?: React.MutableRefObject<any>;
}

export default function CameraController({ target, position, enableOrbit, orbitRef }: Props) {
  const { camera } = useThree();
  const prevPos = useRef(new THREE.Vector3());
  const prevTarget = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      camera.position.copy(position);
      prevPos.current.copy(position);
      prevTarget.current.copy(target);
      initialized.current = true;
      return;
    }

    if (prevPos.current.distanceTo(position) < 0.01 && prevTarget.current.distanceTo(target) < 0.01) return;

    const tl = gsap.timeline();
    const camProxy = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const lookProxy = { x: prevTarget.current.x, y: prevTarget.current.y, z: prevTarget.current.z };

    tl.to(camProxy, {
      x: position.x, y: position.y, z: position.z,
      duration: 2.5,
      ease: "power3.inOut",
      onUpdate() {
        camera.position.set(camProxy.x, camProxy.y, camProxy.z);
        if (orbitRef?.current) {
          orbitRef.current.target.lerp(target, 0.05);
          orbitRef.current.update();
        } else {
          camera.lookAt(lookProxy.x, lookProxy.y, lookProxy.z);
        }
      },
    });

    tl.to(
      lookProxy,
      {
        x: target.x, y: target.y, z: target.z,
        duration: 2.5,
        ease: "power3.inOut",
        onUpdate() {
          if (!orbitRef?.current) camera.lookAt(lookProxy.x, lookProxy.y, lookProxy.z);
        },
      },
      "<"
    );

    prevPos.current.copy(position);
    prevTarget.current.copy(target);

    return () => { tl.kill(); };
  }, [position, target, camera, orbitRef]);

  return null;
}
