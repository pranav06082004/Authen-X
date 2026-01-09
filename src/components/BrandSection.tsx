import { useState, useEffect, useRef, useCallback } from 'react';

const BrandSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [isInSection, setIsInSection] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const animationRef = useRef<number>();

  // Check for mobile/touch devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Smooth cursor follow animation
  useEffect(() => {
    if (isMobile) return;

    const animate = () => {
      setCursorPos(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.15,
        y: prev.y + (targetPos.y - prev.y) * 0.15,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPos, isMobile]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current || isMobile) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    setTargetPos({ x, y });
    
    // Update CSS custom properties for the reveal effect
    if (textRef.current) {
      const textRect = textRef.current.getBoundingClientRect();
      const relativeX = ((e.clientX - textRect.left) / textRect.width) * 100;
      const relativeY = ((e.clientY - textRect.top) / textRect.height) * 100;
      textRef.current.style.setProperty('--mouse-x', `${relativeX}%`);
      textRef.current.style.setProperty('--mouse-y', `${relativeY}%`);
    }
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsInSection(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    setIsInSection(false);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isMobile) return;

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseenter', handleMouseEnter);
    section.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseenter', handleMouseEnter);
      section.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, isMobile]);

  return (
    <>
      {/* Custom Cursor - only visible on desktop */}
      {!isMobile && isInSection && (
        <div
          ref={cursorRef}
          className="fixed pointer-events-none z-[9999] mix-blend-difference"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform',
          }}
        >
          {/* Outer ring */}
          <div 
            className="w-8 h-8 rounded-full border-2 border-white/80 transition-transform duration-200"
            style={{
              transform: isInSection ? 'scale(1.2)' : 'scale(1)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          {/* Inner dot */}
          <div 
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </div>
      )}

      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden bg-background py-20 md:py-24 lg:py-32"
        style={{ cursor: !isMobile && isInSection ? 'none' : 'default' }}
      >
        {/* Spotlight/glow effect */}
        {!isMobile && isInSection && (
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              left: cursorPos.x,
              top: cursorPos.y - (sectionRef.current?.getBoundingClientRect().top || 0),
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(239, 71, 111, 0.15) 0%, rgba(239, 71, 111, 0.05) 30%, transparent 70%)',
              filter: 'blur(20px)',
              willChange: 'transform',
            }}
          />
        )}

        {/* Main Brand Text */}
        <div className="container mx-auto px-4 relative">
          <h2
            ref={textRef}
            className="brand-text-reveal text-center font-bold select-none leading-none tracking-wider"
            style={{
              fontSize: 'clamp(80px, 18vw, 280px)',
              letterSpacing: '0.05em',
              '--mouse-x': '50%',
              '--mouse-y': '50%',
            } as React.CSSProperties}
          >
            Authen-X
          </h2>
        </div>

        {/* Subtle parallax decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute w-64 h-64 rounded-full opacity-5"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
              top: '20%',
              left: '10%',
              transform: `translate(${(cursorPos.x - window.innerWidth / 2) * -0.02}px, ${(cursorPos.y - window.innerHeight / 2) * -0.02}px)`,
              transition: 'transform 0.5s ease-out',
            }}
          />
          <div 
            className="absolute w-48 h-48 rounded-full opacity-5"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
              bottom: '20%',
              right: '15%',
              transform: `translate(${(cursorPos.x - window.innerWidth / 2) * 0.015}px, ${(cursorPos.y - window.innerHeight / 2) * 0.015}px)`,
              transition: 'transform 0.5s ease-out',
            }}
          />
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .brand-text-reveal {
          color: rgba(255, 255, 255, 0.03);
          background: radial-gradient(
            circle 150px at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.4) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: background 0.1s ease;
        }

        @media (max-width: 767px) {
          .brand-text-reveal {
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.08) 0%,
              rgba(255, 255, 255, 0.03) 100%
            );
            -webkit-background-clip: text;
            background-clip: text;
          }
        }
      `}</style>
    </>
  );
};

export default BrandSection;
