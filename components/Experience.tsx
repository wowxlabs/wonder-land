"use client";
import "@/lib/threeSetup";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useExperienceStore } from "@/store/useExperienceStore";
import { Place } from "@/data/places";
import dynamic from "next/dynamic";
import LoaderScreen from "./LoaderScreen";

const SriLankaMap      = dynamic(() => import("./SriLankaMap"),      { ssr: false });
const InfoPanel        = dynamic(() => import("./InfoPanel"),        { ssr: false });
const HUD              = dynamic(() => import("./HUD"),              { ssr: false });
const PlaceExperience  = dynamic(() => import("./PlaceExperience"),  { ssr: false });
const AvatarSelect     = dynamic(() => import("./AvatarSelect"),     { ssr: false });

export default function Experience() {
  const { phase, selectedPlace, setSelectedPlace, setPhase, setIsMobile } = useExperienceStore();
  const dprRef = useRef(1);

  const [showLoader, setShowLoader]           = useState(true);
  const [mapReady, setMapReady]               = useState(false);
  const [musicOn, setMusicOn]                 = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const readyTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapEverReady   = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsMobile]);

  // Phase changes
  useEffect(() => {
    if (phase === "map") {
      if (!mapEverReady.current) {
        // First visit — show the loader until assets signal ready
        setShowLoader(true);
        setMapReady(false);
      }
      // Returning visits — map stayed mounted, skip loader entirely
    } else {
      setShowLoader(false);
      if (readyTimer.current) { clearTimeout(readyTimer.current); readyTimer.current = null; }
    }
  }, [phase]);

  useEffect(() => () => {
    if (readyTimer.current) clearTimeout(readyTimer.current);
  }, []);

  // Map assets loaded — only act on the first signal; subsequent ones are no-ops
  const handleMapReady = useCallback(() => {
    if (mapEverReady.current) return;
    if (readyTimer.current) clearTimeout(readyTimer.current);
    readyTimer.current = setTimeout(() => {
      mapEverReady.current = true;
      setMapReady(true);
      readyTimer.current = null;
    }, 600);
  }, []);

  // User clicks "Explore" on loader — must call play() synchronously inside the gesture
  function handleEnter() {
    setShowLoader(false);
    setMapReady(false);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.25;
      audio.play().catch(() => {});
    }
    setMusicOn(true);
  }

  // Toggle music — must call play/pause synchronously inside the gesture
  function handleToggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      audio.volume = 0.25;
      audio.play().catch(() => {});
      setMusicOn(true);
    }
  }

  function handlePlaceSelect(place: Place) {
    setSelectedPlace(place);
    setPhase("place");
  }

  function handleBackToMap() {
    setSelectedPlace(null);
    setPhase("map");
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", inset: 0 }}>
      {/* Background music */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/ambient.m4a`} loop preload="auto" />

      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          shadows
          dpr={dprRef.current}
          camera={{ fov: 55, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ background: "#87ceeb" }}
        >
          <PerformanceMonitor
            onDecline={() => { dprRef.current = 0.75; }}
            onIncline={() => { dprRef.current = 1; }}
          />
          <Suspense fallback={null}>
            {/* Always mounted — toggling visible keeps assets in GPU memory */}
            <SriLankaMap
              active={phase === "map"}
              rotationEnabled={rotationEnabled}
              onPlaceSelect={handlePlaceSelect}
              onReady={handleMapReady}
              onAvatarPadClick={() => setShowAvatarSelect(true)}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Place storytelling overlay — rendered outside the Canvas */}
      {phase === "place" && selectedPlace && (
        <PlaceExperience place={selectedPlace} onBack={handleBackToMap} />
      )}

      {/* Avatar selection overlay */}
      {showAvatarSelect && (
        <AvatarSelect onClose={() => setShowAvatarSelect(false)} />
      )}

      <LoaderScreen
        show={phase === "map" && showLoader}
        isReady={mapReady}
        onEnter={handleEnter}
      />

      <HUD
        onBackToMap={phase === "place" ? handleBackToMap : undefined}
        currentPlace={selectedPlace}
        musicOn={musicOn}
        onToggleMusic={handleToggleMusic}
        rotationEnabled={rotationEnabled}
        onToggleRotation={() => setRotationEnabled(v => !v)}
      />

      <InfoPanel />
    </div>
  );
}
