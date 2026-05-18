import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800", "900"], subsets: ["latin"] });

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = spring({ frame, fps, config: { damping: 12 } });

  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 15, fps, config: { damping: 16 } }), [0, 1], [30, 0]);

  const subOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 50, fps, config: { damping: 10, stiffness: 130 } });

  // Pulse on CTA
  const pulse = 1 + Math.sin((frame / fps) * 4) * 0.02;

  const float = Math.sin((frame / fps) * 1.5) * 5;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily, padding: 60 }}>
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale}) translateY(${float}px)`,
          width: 130,
          height: 130,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(3,105,161,0.35)",
          border: "4px solid rgba(255,255,255,0.9)",
          marginBottom: 30,
        }}
      >
        <Img src={staticFile("images/logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 80,
          fontWeight: 900,
          color: "#0C2942",
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        Try PreciseDM
      </div>

      <div
        style={{
          opacity: subOpacity,
          fontSize: 30,
          fontWeight: 600,
          color: "#0369A1",
          marginTop: 18,
          textAlign: "center",
        }}
      >
        Free for 7 days. No credit card.
      </div>

      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale * pulse})`,
          marginTop: 50,
          background: "linear-gradient(135deg, #0EA5E9, #0369A1)",
          padding: "22px 56px",
          borderRadius: 999,
          color: "white",
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: 0.5,
          boxShadow: "0 20px 50px rgba(3,105,161,0.45)",
        }}
      >
        precisedm.com
      </div>

      <div
        style={{
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" }),
          marginTop: 40,
          fontSize: 24,
          fontWeight: 700,
          color: "#0C2942",
          letterSpacing: 1.5,
        }}
      >
        Built by clinicians. For clinicians.
      </div>
    </AbsoluteFill>
  );
};
