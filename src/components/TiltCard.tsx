import { ReactNode } from "react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  borderColor?: string;
}

export function TiltCard({ 
  children, 
  className, 
  maxTilt = 5,
  borderColor = "rgb(239, 71, 111)" 
}: TiltCardProps) {
  const { ref, style, onMouseMove, onMouseEnter, onMouseLeave } = use3DTilt(maxTilt);

  return (
    <div
      ref={ref}
      className={cn(
        "relative cursor-pointer",
        className
      )}
      style={{
        ...style,
        borderTop: `2px solid ${borderColor}`,
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
