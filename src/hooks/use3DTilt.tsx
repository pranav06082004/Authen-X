import { useState, useRef, useCallback } from "react";

interface TiltState {
  rotateX: number;
  rotateY: number;
  translateZ: number;
  shadowX: number;
  shadowY: number;
}

interface Use3DTiltReturn {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function use3DTilt(maxTilt: number = 5): Use3DTiltReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    translateZ: 0,
    shadowX: 0,
    shadowY: 0,
  });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate position relative to center (-1 to 1)
      const relativeX = (e.clientX - centerX) / (rect.width / 2);
      const relativeY = (e.clientY - centerY) / (rect.height / 2);

      // Calculate tilt angles (inverted for natural feel)
      const rotateX = -relativeY * maxTilt;
      const rotateY = relativeX * maxTilt;

      // Shadow offset based on tilt
      const shadowX = relativeX * 10;
      const shadowY = relativeY * 10;

      setTilt({
        rotateX,
        rotateY,
        translateZ: 20,
        shadowX,
        shadowY,
      });
    },
    [maxTilt]
  );

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      shadowX: 0,
      shadowY: 0,
    });
  }, []);

  const style: React.CSSProperties = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${tilt.translateZ}px)`
      : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
    transformStyle: "preserve-3d",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: isHovered
      ? `${-tilt.shadowX}px ${-tilt.shadowY + 15}px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(34, 211, 238, 0.15)`
      : "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  return {
    ref,
    style,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  };
}
