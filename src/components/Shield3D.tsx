import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

export function Shield3D() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
      
      // Floating effect
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Shield shape using extruded geometry */}
      <mesh>
        <extrudeGeometry
          args={[
            (() => {
              const shape = new THREE.Shape();
              // Create shield outline
              shape.moveTo(0, 2);
              shape.lineTo(1.5, 1.5);
              shape.lineTo(1.5, -0.5);
              shape.lineTo(0, -2);
              shape.lineTo(-1.5, -0.5);
              shape.lineTo(-1.5, 1.5);
              shape.lineTo(0, 2);
              return shape;
            })(),
            { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 }
          ]}
        />
        <meshStandardMaterial
          color="#22d3ee"
          metalness={0.8}
          roughness={0.2}
          emissive="#0891b2"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Checkmark on shield */}
      <mesh position={[0, 0, 0.6]}>
        <torusGeometry args={[0.3, 0.08, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.1}
          emissive="#f59e0b"
          emissiveIntensity={0.6}
        />
      </mesh>
      
      <mesh position={[0.15, -0.3, 0.6]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.1}
          emissive="#f59e0b"
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
}
