import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800", "900"], subsets: ["latin"] });

const lines = [
  "Variable patient response.",
  "Tight clinical timelines.",
  "High cognitive load.",
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily, padding: 80 }}>
      <div
        style={{
          opacity: labelOpacity,
          fontSize: 22,
          fontWeight: 700,
          color: "#0369A1",
          letterSpacing: 4,
          marginBottom: 40,
          textTransform: "uppercase",
        }}
      >
        Insulin dosing is hard.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start", maxWidth: 820 }}>
        {lines.map((line, i) => {
          const start = 20 + i * 25;
          const sp = spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 130 } });
          const x = interpolate(sp, [0, 1], [-60, 0]);
          const opacity = interpolate(frame, [start, start + 20], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0EA5E9, #0369A1)",
                  boxShadow: "0 0 20px rgba(14,165,233,0.6)",
                }}
              />
              <div style={{ fontSize: 56, fontWeight: 800, color: "#0C2942", letterSpacing: -1 }}>{line}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          opacity: interpolate(frame, [100, 118], [0, 1], { extrapolateRight: "clamp" }),
          marginTop: 50,
          fontSize: 28,
          fontWeight: 600,
          color: "#0369A1",
          fontStyle: "italic",
        }}
      >
        There's a better way.
      </div>
    </AbsoluteFill>
  );
};
