import { forwardRef } from "react";
import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";

interface PreciseLogoProps {
  size?: number;
  variant?: "icon" | "full";
}

const PreciseLogo = forwardRef<HTMLImageElement, PreciseLogoProps>(
  ({ size = 80, variant = "icon" }, ref) => (
    <img
      ref={ref}
      src={variant === "full" ? logoFull : logoIcon}
      alt="PreciseDM"
      style={{ height: size }}
      className="object-contain"
    />
  )
);

PreciseLogo.displayName = "PreciseLogo";

export default PreciseLogo;
