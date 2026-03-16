import { forwardRef } from "react";
import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";

interface PreciseLogoProps {
  size?: number;
  variant?: "icon" | "full";
}

const PreciseLogo = forwardRef<HTMLDivElement, PreciseLogoProps>(
  ({ size = 80, variant = "icon" }, ref) => {
    if (variant === "full") {
      return (
        <img
          src={logoFull}
          alt="PreciseDM"
          style={{ height: size }}
          className="object-contain"
        />
      );
    }
    return (
      <div ref={ref} className="flex items-center gap-2">
        <img
          src={logoIcon}
          alt="PreciseDM"
          style={{ height: size, width: size }}
          className="rounded-full object-cover"
        />
        <span className="text-sm font-bold text-foreground tracking-tight">Precise DM</span>
      </div>
    );
  }
);

PreciseLogo.displayName = "PreciseLogo";

export default PreciseLogo;
