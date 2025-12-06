import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MousePosition {
  x: number;
  y: number;
}

export function Logo3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [idleRotation, setIdleRotation] = useState(0);

  // Idle floating animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setIdleRotation(prev => prev + 0.5);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position (-5 to 5 degrees)
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 5;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 5;
    
    setMousePos({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Calculate floating offset based on idle rotation
  const floatY = Math.sin(idleRotation * 0.02) * 8;
  const floatRotate = Math.sin(idleRotation * 0.01) * 2;

  return (
    <div className="w-full py-16 relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute w-[300px] h-[300px] bg-secondary/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* 3D Logo Container */}
      <div
        ref={containerRef}
        className="relative mx-auto w-[280px] h-[280px] md:w-[320px] md:h-[320px] cursor-pointer"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: isHovered ? mousePos.x : floatRotate,
            rotateY: isHovered ? mousePos.y : floatRotate * 0.5,
            translateY: floatY,
            translateZ: isHovered ? 30 : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          {/* Glow ring behind logo */}
          <div 
            className="absolute w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full"
            style={{
              background: 'radial-gradient(circle, transparent 40%, rgba(239, 71, 111, 0.1) 60%, transparent 70%)',
              transform: 'translateZ(-20px)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />

          {/* Main Logo Container */}
          <div
            className="relative flex items-center justify-center"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Logo Background Circle */}
            <div
              className="absolute w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)',
                border: '2px solid rgba(239, 71, 111, 0.3)',
                boxShadow: isHovered 
                  ? '0 0 60px rgba(239, 71, 111, 0.6), 0 0 100px rgba(239, 71, 111, 0.3), inset 0 0 40px rgba(239, 71, 111, 0.1)'
                  : '0 0 40px rgba(239, 71, 111, 0.4), 0 0 60px rgba(239, 71, 111, 0.2)',
                transform: 'translateZ(10px)',
                transition: 'box-shadow 0.3s ease',
              }}
            />

            {/* A-X Logo Text */}
            <div
              className="relative z-10 select-none"
              style={{
                transform: 'translateZ(40px)',
              }}
            >
              <span
                className="text-7xl md:text-8xl font-black tracking-tighter"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, rgb(239, 71, 111) 50%, rgb(251, 144, 20) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: isHovered ? 'drop-shadow(0 0 20px rgba(239, 71, 111, 0.8))' : 'drop-shadow(0 0 10px rgba(239, 71, 111, 0.5))',
                  transition: 'filter 0.3s ease',
                }}
              >
                A-X
              </span>
            </div>

            {/* Decorative floating elements */}
            <div
              className="absolute w-3 h-3 rounded-full bg-primary"
              style={{
                top: '10%',
                right: '15%',
                transform: `translateZ(60px) translateY(${Math.sin(idleRotation * 0.03) * 5}px)`,
                boxShadow: '0 0 15px rgba(239, 71, 111, 0.8)',
              }}
            />
            <div
              className="absolute w-2 h-2 rounded-full bg-secondary"
              style={{
                bottom: '15%',
                left: '20%',
                transform: `translateZ(50px) translateY(${Math.cos(idleRotation * 0.025) * 6}px)`,
                boxShadow: '0 0 12px rgba(251, 144, 20, 0.8)',
              }}
            />
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: '25%',
                left: '10%',
                background: 'rgb(106, 90, 205)',
                transform: `translateZ(45px) translateY(${Math.sin(idleRotation * 0.02 + 1) * 4}px)`,
                boxShadow: '0 0 10px rgba(106, 90, 205, 0.8)',
              }}
            />
          </div>
        </motion.div>

        {/* Bottom reflection/shadow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] h-[30px] rounded-full blur-xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(239, 71, 111, 0.3) 0%, transparent 70%)',
            transform: `translateX(-50%) scaleY(${isHovered ? 0.6 : 0.8})`,
            opacity: isHovered ? 0.8 : 0.5,
            transition: 'all 0.3s ease',
          }}
        />
      </div>

      {/* Brand tagline */}
      <motion.p
        className="text-center text-muted-foreground mt-8 text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="font-semibold text-foreground">AuthenX</span> — Verify What's Real
      </motion.p>
    </div>
  );
}