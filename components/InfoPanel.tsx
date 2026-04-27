"use client";
import { useEffect, useState } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

export default function InfoPanel() {
  const { activeInfoPoint, showInfoPanel, setShowInfoPanel, setActiveInfoPoint } = useExperienceStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showInfoPanel) {
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [showInfoPanel]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      setShowInfoPanel(false);
      setActiveInfoPoint(null);
    }, 300);
  }

  if (!showInfoPanel || !activeInfoPoint) return null;

  const isNPC = activeInfoPoint.type === "npc";
  const accentColor = isNPC ? "#fbbf24" : "#38bdf8";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(5, 12, 28, 0.95)",
          border: `1px solid ${accentColor}30`,
          borderRadius: 16,
          padding: "32px",
          maxWidth: 480,
          width: "100%",
          boxShadow: `0 0 40px ${accentColor}20, 0 24px 64px rgba(0,0,0,0.6)`,
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div
              className="text-xs tracking-widest uppercase mb-2 font-semibold"
              style={{ color: accentColor }}
            >
              {isNPC ? "👤 Local Story" : activeInfoPoint.type === "landmark" ? "🏛️ Landmark" : "ℹ️ Did You Know"}
            </div>
            <h2 className="text-xl font-bold text-slate-100 leading-tight">
              {isNPC ? (activeInfoPoint.npcName ?? activeInfoPoint.title) : activeInfoPoint.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-4 shrink-0 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-5"
          style={{ background: `linear-gradient(90deg, ${accentColor}40, transparent)` }}
        />

        {/* Short description */}
        <p
          className="text-sm mb-4 font-medium"
          style={{ color: accentColor + "cc" }}
        >
          {activeInfoPoint.description}
        </p>

        {/* Full details */}
        <p className="text-sm text-slate-400 leading-relaxed">
          {isNPC ? (
            <span className="italic">"{activeInfoPoint.details}"</span>
          ) : (
            activeInfoPoint.details
          )}
        </p>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div
            className="text-xs text-slate-600 tracking-widest uppercase"
          >
            {isNPC ? `— ${activeInfoPoint.npcName}` : "Historical Record"}
          </div>
          <button
            onClick={handleClose}
            className="text-xs px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
              border: `1px solid ${accentColor}40`,
              color: accentColor,
            }}
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
