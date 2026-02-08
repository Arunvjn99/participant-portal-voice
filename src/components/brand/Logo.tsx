import { AscendLogo } from "./AscendLogo";
import { branding } from "../../config/branding";

interface LogoProps {
  className?: string;
  /** "full" = Ascend logo PNG (auth). "icon" = icon only (dashboard with separate app name). */
  variant?: "full" | "icon";
}

export const Logo = ({ className, variant = "full" }: LogoProps) => {
  if (variant === "full") {
    return (
      <img
        src={branding.logo.src}
        alt={branding.logo.alt}
        className={className}
      />
    );
  }
  return <AscendLogo className={className} variant={variant} />;
};
