"use client";
import dynamic from "next/dynamic";

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100vw", height: "100vh",
      backgroundImage: "url('/game.png')",
      backgroundSize: "cover", backgroundPosition: "center",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(4,8,28,0.72)",
      }} />
      <span style={{
        position: "relative",
        fontFamily: "system-ui, sans-serif",
        fontSize: 13, letterSpacing: "0.22em",
        color: "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
      }}>
        Loading…
      </span>
    </div>
  ),
});

export default function Home() {
  return <Experience />;
}
