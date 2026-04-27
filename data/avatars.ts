export interface Avatar {
  id: string;
  name: string;
  title: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  skinColor: string;
  accessory: "hat" | "scarf" | "glasses" | "headband" | "none";
  gender: "boy" | "girl";
}

export const AVATARS: Avatar[] = [
  {
    id: "boy",
    name: "Ashan",
    title: "Boy",
    description: "A curious adventurer ready to explore every corner of the island.",
    primaryColor: "#1e40af",
    secondaryColor: "#3b82f6",
    accentColor: "#fbbf24",
    skinColor: "#c4956a",
    accessory: "hat",
    gender: "boy",
  },
  {
    id: "girl",
    name: "Sithara",
    title: "Girl",
    description: "A spirited explorer with a passion for history and hidden stories.",
    primaryColor: "#7c3aed",
    secondaryColor: "#a855f7",
    accentColor: "#f472b6",
    skinColor: "#b5835a",
    accessory: "headband",
    gender: "girl",
  },
];
