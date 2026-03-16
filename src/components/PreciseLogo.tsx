import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";

interface PreciseLogoProps {
  size?: number;
  variant?: "icon" | "full";
}

const PreciseLogo = ({ size = 80, variant = "icon" }: PreciseLogoProps) => (
  <img
    src={variant === "full" ? logoFull : logoIcon}
    alt="PreciseDM"
    style={{ height: size }}
    className="object-contain"
  />
);

export default PreciseLogo;
