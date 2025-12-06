import { useState, useCallback, useRef, useEffect } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
  isHovered: boolean;
}

interface Use3DTiltOptions {
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  transitionSpeed?: number;
  disabled?: boolean;
}

export const use3DTilt = (options: Use3DTiltOptions = {}) => {
  const {
    maxTilt = 5,
    scale = 1.02,
    perspective = 1500,
    transitionSpeed = 400,
    disabled = false,
  } = options;

  const [tiltState, setTiltState] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    isHovered: false,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const isReducedMotion = useRef(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      isReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || isReducedMotion.current || !cardRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const rotateY = (mouseX / (rect.width / 2)) * maxTilt;
      const rotateX = -(mouseY / (rect.height / 2)) * maxTilt;

      setTiltState({
        rotateX,
        rotateY,
        scale,
        isHovered: true,
      });
    });
  }, [disabled, maxTilt, scale]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || isReducedMotion.current) return;
    setTiltState(prev => ({ ...prev, isHovered: true, scale }));
  }, [disabled, scale]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setTiltState({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      isHovered: false,
    });
  }, []);

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    setTiltState(prev => ({ ...prev, scale: 1.03, isHovered: true }));
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    setTiltState({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      isHovered: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    perspective: `${perspective}px`,
    perspectiveOrigin: 'center',
  };

  const cardStyle: React.CSSProperties = {
    transform: `rotateY(${tiltState.rotateY}deg) rotateX(${tiltState.rotateX}deg) translateZ(${tiltState.isHovered ? 20 : 0}px) scale(${tiltState.scale})`,
    transition: tiltState.isHovered 
      ? `transform ${transitionSpeed * 0.1}ms cubic-bezier(0.23, 1, 0.32, 1)` 
      : `transform ${transitionSpeed}ms cubic-bezier(0.23, 1, 0.32, 1)`,
    transformStyle: 'preserve-3d' as const,
    willChange: 'transform',
  };

  return {
    cardRef,
    containerStyle,
    cardStyle,
    tiltState,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
};
