import { create } from "zustand";
import { Place } from "@/data/places";
import { Avatar } from "@/data/avatars";

export type ExperiencePhase = "map" | "place";

export interface InfoPoint {
  id: string;
  title: string;
  description: string;
  details: string;
  position: [number, number, number];
  type: "info" | "npc" | "landmark";
  npcName?: string;
}

interface ExperienceState {
  phase: ExperiencePhase;
  selectedAvatar: Avatar | null;
  selectedPlace: Place | null;
  nearbyPlace: Place | null;
  isNavigationMode: boolean;
  activeInfoPoint: InfoPoint | null;
  showInfoPanel: boolean;
  isMobile: boolean;

  setPhase: (phase: ExperiencePhase) => void;
  setSelectedAvatar: (avatar: Avatar | null) => void;
  setSelectedPlace: (place: Place | null) => void;
  setNearbyPlace: (place: Place | null) => void;
  setNavigationMode: (val: boolean) => void;
  setActiveInfoPoint: (point: InfoPoint | null) => void;
  setShowInfoPanel: (val: boolean) => void;
  setIsMobile: (val: boolean) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  phase: "map",
  selectedAvatar: null,
  selectedPlace: null,
  nearbyPlace: null,
  isNavigationMode: true,
  activeInfoPoint: null,
  showInfoPanel: false,
  isMobile: false,

  setPhase: (phase) => set({ phase }),
  setSelectedAvatar: (selectedAvatar) => set({ selectedAvatar: selectedAvatar ?? null }),
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
  setNearbyPlace: (nearbyPlace) => set({ nearbyPlace }),
  setNavigationMode: (isNavigationMode) => set({ isNavigationMode }),
  setActiveInfoPoint: (activeInfoPoint) => set({ activeInfoPoint }),
  setShowInfoPanel: (showInfoPanel) => set({ showInfoPanel }),
  setIsMobile: (isMobile) => set({ isMobile }),
}));
