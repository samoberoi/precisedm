import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800", "900"], subsets: ["latin"] });

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const titleY = interpolate(spring({ frame: frame - 15, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

  const subY = interpolate(spring({ frame: frame - 30, fps, config: { damping: 18 } }), [0, 1], [30, 0]);
  const subOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  const badgeOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 50, fps, config: { damping: 10 } });

  // Floating motion
  const float = Math.sin((frame / fps) * 1.2) * 6;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <div
        style={{
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          padding: "10px 24px",
          borderRadius: 999,
          fontSize: 22,
          fontWeight: 700,
          color: "#0369A1",
          letterSpacing: 3,
          marginBottom: 36,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 10px 30px rgba(3,105,161,0.15)",
        }}
      >
        NOW LIVE
      </div>

      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale}) translateY(${float}px)`,
          marginBottom: 30,
          width: 180,
          height: 180,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(3,105,161,0.35)",
          border: "4px solid rgba(255,255,255,0.9)",
        }}
      >
        <Img src={staticFile("images/logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 110,
          fontWeight: 900,
          color: "#0C2942",
          letterSpacing: -3,
          lineHeight: 1,
        }}
      >
        PreciseDM
      </div>

      <div
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          fontSize: 32,
          fontWeight: 600,
          color: "#0369A1",
          marginTop: 20,
          letterSpacing: 0.5,
        }}
      >
        Precision Insulin Dosing Platform
      </div>
    </AbsoluteFill>
  );
};
