import React from 'react';
import { use3DTilt } from '@/hooks/use3DTilt';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxTilt?: number;
  scale?: number;
  glowColor?: string;
  accentColor?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  containerClassName,
  maxTilt = 5,
  scale = 1.02,
  glowColor = 'rgba(239, 71, 111, 0.3)',
  accentColor = 'rgb(239, 71, 111)',
}) => {
  const { cardRef, containerStyle, cardStyle, tiltState, handlers } = use3DTilt({
    maxTilt,
    scale,
  });

  return (
    <div className={cn('perspective-container', containerClassName)} style={containerStyle}>
      <div
        ref={cardRef}
        className={cn(
          'tilt-card-3d relative z-[6]',
          className
        )}
        style={{
          ...cardStyle,
          borderTop: tiltState.isHovered ? `3px solid ${accentColor}` : `2px solid ${accentColor}`,
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          boxShadow: tiltState.isHovered
            ? `0 20px 60px ${glowColor}, 0 10px 30px rgba(0, 0, 0, 0.5), 0 -4px 20px ${glowColor.replace('0.3', '0.6')}`
            : `0 4px 20px rgba(0, 0, 0, 0.2)`,
        }}
        {...handlers}
      >
        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-400"
          style={{
            background: `linear-gradient(135deg, ${accentColor.replace('rgb', 'rgba').replace(')', ', 0.1)')}, rgba(106, 90, 205, 0.1))`,
            opacity: tiltState.isHovered ? 1 : 0,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
