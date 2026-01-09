import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import { TexturedCube } from "./TexturedCube";
import { Suspense, useEffect, useState, useCallback } from "react";

export function FloatingGeometryCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Normalize mouse position to -1 to 1
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // Hide on mobile for performance
  if (isMobile) return null;

  // Scale factor for tablet
  const scale = isTablet ? 0.7 : 1;

  return (
    <div 
      className="absolute right-0 top-0 w-[65%] h-full pointer-events-none"
      style={{
        transform: `translateX(25%)`,
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        {/* Ambient lighting - subtle fill */}
        <ambientLight intensity={0.15} />
        
        {/* Main key light from top-left */}
        <directionalLight 
          position={[-5, 8, 5]} 
          intensity={0.8}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        {/* Rim light for edge definition */}
        <directionalLight 
          position={[5, -3, -5]} 
          intensity={0.4}
          color="#ffffff"
        />
        
        {/* Subtle blue accent light */}
        <pointLight 
          position={[-3, 3, 3]} 
          intensity={0.3}
          color="#3b82f6"
        />
        
        {/* Bottom fill light */}
        <pointLight 
          position={[0, -5, 2]} 
          intensity={0.15}
          color="#1e40af"
        />
        
        {/* Spot light for dramatic effect */}
        <spotLight
          position={[5, 5, 5]}
          angle={0.4}
          penumbra={1}
          intensity={0.5}
          color="#ffffff"
          castShadow
        />
        
        <Suspense fallback={null}>
          <group scale={scale}>
            <TexturedCube mousePosition={mousePosition} />
          </group>
          <Environment preset="night" />
        </Suspense>
        
        {/* Ground plane for shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.15} />
        </mesh>
      </Canvas>
    </div>
  );
}
