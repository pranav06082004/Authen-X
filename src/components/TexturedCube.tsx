import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TexturedCubeProps {
  mousePosition: { x: number; y: number };
}

// Create procedural textures for each face
function createGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createDotsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.fillStyle = "#2a2a2a";
  for (let x = 16; x < 512; x += 32) {
    for (let y = 16; y < 512; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 128, 128);
  
  // Carbon fiber pattern
  const gradient1 = ctx.createLinearGradient(0, 0, 64, 64);
  gradient1.addColorStop(0, "#222222");
  gradient1.addColorStop(0.5, "#1a1a1a");
  gradient1.addColorStop(1, "#222222");
  
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillRect(64, 64, 64, 64);
  
  const gradient2 = ctx.createLinearGradient(64, 0, 128, 64);
  gradient2.addColorStop(0, "#1a1a1a");
  gradient2.addColorStop(0.5, "#252525");
  gradient2.addColorStop(1, "#1a1a1a");
  
  ctx.fillStyle = gradient2;
  ctx.fillRect(64, 0, 64, 64);
  ctx.fillRect(0, 64, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createMetallicTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#2a2a2a");
  gradient.addColorStop(0.3, "#1a1a1a");
  gradient.addColorStop(0.5, "#2a2a2a");
  gradient.addColorStop(0.7, "#1a1a1a");
  gradient.addColorStop(1, "#2a2a2a");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Subtle noise
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const alpha = Math.random() * 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createLinesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.strokeStyle = "#252525";
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 512; i += 8) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createDiagonalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  
  for (let i = -512; i < 1024; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 512, 512);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function TexturedCube({ mousePosition }: TexturedCubeProps) {
  const cubeRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  
  // Create textures once
  const materials = useMemo(() => {
    const gridTex = createGridTexture();
    const dotsTex = createDotsTexture();
    const carbonTex = createCarbonTexture();
    const metallicTex = createMetallicTexture();
    const linesTex = createLinesTexture();
    const diagonalTex = createDiagonalTexture();
    
    return [
      // Right face - Grid
      new THREE.MeshStandardMaterial({
        map: gridTex,
        roughness: 0.7,
        metalness: 0.3,
      }),
      // Left face - Dots
      new THREE.MeshStandardMaterial({
        map: dotsTex,
        roughness: 0.8,
        metalness: 0.2,
      }),
      // Top face - Metallic
      new THREE.MeshStandardMaterial({
        map: metallicTex,
        roughness: 0.3,
        metalness: 0.9,
      }),
      // Bottom face - Carbon
      new THREE.MeshStandardMaterial({
        map: carbonTex,
        roughness: 0.6,
        metalness: 0.4,
      }),
      // Front face - Lines
      new THREE.MeshStandardMaterial({
        map: linesTex,
        roughness: 0.5,
        metalness: 0.5,
      }),
      // Back face - Diagonal
      new THREE.MeshStandardMaterial({
        map: diagonalTex,
        roughness: 0.6,
        metalness: 0.4,
      }),
    ];
  }, []);

  useFrame((state) => {
    if (!cubeRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Slow continuous rotation (25 second full rotation on Y)
    const baseRotationY = time * ((Math.PI * 2) / 25);
    
    // Subtle mouse influence
    targetRotation.current.x = mousePosition.y * 0.15;
    targetRotation.current.y = mousePosition.x * 0.15;
    
    // Smooth interpolation for mouse movement
    cubeRef.current.rotation.x = THREE.MathUtils.lerp(
      cubeRef.current.rotation.x,
      0.4 + targetRotation.current.x,
      0.05
    );
    cubeRef.current.rotation.y = THREE.MathUtils.lerp(
      cubeRef.current.rotation.y,
      baseRotationY + targetRotation.current.y,
      0.05
    );
    
    // Subtle floating motion (10px equivalent, 8 second cycle)
    cubeRef.current.position.y = Math.sin(time * 0.785) * 0.15;
    
    // Very subtle Z oscillation for depth
    cubeRef.current.position.z = Math.sin(time * 0.5) * 0.05;
  });

  return (
    <group ref={cubeRef} rotation={[0.4, 0.8, 0]}>
      {/* Main textured cube */}
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 3]} />
      </mesh>
      
      {/* Edge glow effect - wireframe */}
      <mesh>
        <boxGeometry args={[3.02, 3.02, 3.02]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
      
      {/* Outer glow shell */}
      <mesh>
        <boxGeometry args={[3.1, 3.1, 3.1]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Inner cube for depth */}
      <mesh ref={innerRef} scale={0.95}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}
