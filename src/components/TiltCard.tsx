import { ReactNode, useState } from "react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  borderColor?: string;
  glowOnHover?: boolean;
}

export function TiltCard({ 
  children, 
  className, 
  maxTilt = 5,
  borderColor = "rgb(239, 71, 111)",
  glowOnHover = true
}: TiltCardProps) {
  const { ref, style, onMouseMove, onMouseEnter, onMouseLeave } = use3DTilt(maxTilt);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave();
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        className
      )}
      style={{
        ...style,
        borderTop: `2px solid ${borderColor}`,
        borderImage: isHovered && glowOnHover 
          ? `linear-gradient(90deg, ${borderColor}, rgba(239, 71, 111, 0.5), ${borderColor}) 1`
          : undefined,
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow overlay */}
      {glowOnHover && (
        <div 
          className={cn(
            "absolute inset-0 rounded-inherit pointer-events-none transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: `linear-gradient(180deg, rgba(239, 71, 111, 0.1) 0%, transparent 50%)`,
            borderRadius: 'inherit',
          }}
        />
      )}
      {children}
    </div>
  );
}
