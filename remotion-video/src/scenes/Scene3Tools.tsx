import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800", "900"], subsets: ["latin"] });

const tools = [
  { name: "DiaForm", desc: "Initial insulin dosing", color: "#1E88E5" },
  { name: "Maintenance", desc: "Ongoing insulin dosing", color: "#F4A623" },
  { name: "Steroid", desc: "Insulin dosing for steroid-induced hyperglycemia", color: "#34495E" },
  { name: "Gestation", desc: "Ongoing insulin dosing", color: "#E76F51" },
];

export const Scene3Tools: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(spring({ frame, fps, config: { damping: 16 } }), [0, 1], [-20, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily, padding: 60 }}>
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          fontSize: 22,
          fontWeight: 700,
          color: "#0369A1",
          letterSpacing: 4,
          marginBottom: 16,
          textTransform: "uppercase",
        }}
      >
        Four precision insulin dosing tools
      </div>
      <div
        style={{
          opacity: headerOpacity,
          fontSize: 56,
          fontWeight: 900,
          color: "#0C2942",
          marginBottom: 50,
          letterSpacing: -1.5,
          textAlign: "center",
        }}
      >
        One complete suite.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
          width: 880,
        }}
      >
        {tools.map((t, i) => {
          const start = 25 + i * 12;
          const sp = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 140 } });
          const scale = interpolate(sp, [0, 1], [0.7, 1]);
          const opacity = interpolate(frame, [start, start + 18], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div
              key={t.name}
              style={{
                opacity,
                transform: `scale(${scale})`,
                background: `linear-gradient(135deg, ${t.color}, ${t.color}CC)`,
                borderRadius: 28,
                padding: "32px 30px",
                color: "white",
                boxShadow: `0 20px 50px ${t.color}55`,
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.5 }}>{t.name}</div>
              <div style={{ fontSize: 20, fontWeight: 500, opacity: 0.9 }}>{t.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
