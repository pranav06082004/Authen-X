import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import { FloatingGeometry } from "./FloatingGeometry";
import { Suspense, useEffect, useState } from "react";

export function FloatingGeometryCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Hide on mobile for performance
  if (isMobile) return null;

  // Parallax offset based on scroll
  const parallaxOffset = scrollY * 0.0005;

  return (
    <div 
      className="absolute right-0 top-0 w-[60%] h-full pointer-events-none"
      style={{
        transform: `translateX(15%) translateY(${parallaxOffset * 50}px)`,
      }}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        
        {/* Ambient lighting - dim for dark aesthetic */}
        <ambientLight intensity={0.1} />
        
        {/* Main directional light */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.5}
          color="#ffffff"
        />
        
        {/* Rim lighting for edge definition */}
        <directionalLight 
          position={[-5, -5, -5]} 
          intensity={0.3}
          color="#3b82f6"
        />
        
        {/* Top accent light */}
        <pointLight 
          position={[0, 5, 0]} 
          intensity={0.2}
          color="#0ea5e9"
        />
        
        <Suspense fallback={null}>
          <FloatingGeometry />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
