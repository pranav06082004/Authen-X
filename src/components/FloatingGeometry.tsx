import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Slow continuous rotation (25 second loop)
      meshRef.current.rotation.x = time * 0.08;
      meshRef.current.rotation.y = time * 0.12;
      
      // Gentle floating motion
      groupRef.current.position.y = Math.sin(time * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.8}
          envMapIntensity={0.5}
        />
      </mesh>
      
      {/* Inner wireframe for depth */}
      <mesh rotation={[0.2, 0.3, 0]}>
        <icosahedronGeometry args={[2.4, 0]} />
        <meshBasicMaterial
          color="#333333"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Rim light effect mesh */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[2.52, 0]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
