import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800", "900"], subsets: ["latin"] });

const features = [
  "Evidence-based algorithms",
  "Results in seconds",
  "Saved patient history",
  "Built by clinicians",
];

export const Scene4Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = interpolate(spring({ frame, fps, config: { damping: 14 } }), [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily, padding: 80 }}>
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          fontSize: 64,
          fontWeight: 900,
          color: "#0C2942",
          letterSpacing: -2,
          textAlign: "center",
          marginBottom: 50,
          lineHeight: 1.1,
        }}
      >
        Confidence,<br />on every shift.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {features.map((f, i) => {
          const start = 20 + i * 12;
          const sp = spring({ frame: frame - start, fps, config: { damping: 16 } });
          const x = interpolate(sp, [0, 1], [40, 0]);
          const opacity = interpolate(frame, [start, start + 18], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div
              key={f}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: "rgba(255,255,255,0.65)",
                padding: "16px 28px",
                borderRadius: 18,
                boxShadow: "0 8px 24px rgba(3,105,161,0.1)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0EA5E9, #0369A1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: 30, fontWeight: 600, color: "#0C2942" }}>{f}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
