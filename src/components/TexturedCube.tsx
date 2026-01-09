import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TexturedCubeProps {
  mousePosition: { x: number; y: number };
}

// Create various procedural textures
function createMatteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 180);
  gradient.addColorStop(0, "#2a2a2a");
  gradient.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  
  return new THREE.CanvasTexture(canvas);
}

function createGlossyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  
  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, "#3a3a3a");
  gradient.addColorStop(0.3, "#1a1a1a");
  gradient.addColorStop(0.7, "#2a2a2a");
  gradient.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  
  // Highlight
  const highlight = ctx.createRadialGradient(80, 80, 0, 80, 80, 100);
  highlight.addColorStop(0, "rgba(255,255,255,0.15)");
  highlight.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, 256, 256);
  
  return new THREE.CanvasTexture(canvas);
}

function createHexagonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 256, 256);
  
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  
  const size = 12;
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
      const x = col * size * 1.5 + (row % 2) * size * 0.75;
      const y = row * size * 0.866;
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size * 0.4 * Math.cos(angle);
        const py = y + size * 0.4 * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createDotsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 256, 256);
  
  ctx.fillStyle = "#333333";
  for (let x = 8; x < 256; x += 16) {
    for (let y = 8; y < 256; y += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createSpeckledTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 256, 256);
  
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const alpha = Math.random() * 0.4 + 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 64, 64);
  
  const gradient1 = ctx.createLinearGradient(0, 0, 32, 32);
  gradient1.addColorStop(0, "#252525");
  gradient1.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillRect(32, 32, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 256, 256);
  
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 256; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createAXTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  
  // Background gradient
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
  gradient.addColorStop(0, "#2a2a2a");
  gradient.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // A-X text
  ctx.font = "bold 160px 'Outfit', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Glow effect
  ctx.shadowColor = "#3b82f6";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("A-X", 256, 256);
  
  // Second pass for sharpness
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("A-X", 256, 256);
  
  return new THREE.CanvasTexture(canvas);
}

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 256, 256);
  
  // Horizontal brush strokes
  for (let y = 0; y < 256; y++) {
    const alpha = Math.random() * 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, y, 256, 1);
  }
  
  return new THREE.CanvasTexture(canvas);
}

// Individual tile component
function Tile({ 
  position, 
  material, 
  size = 0.9 
}: { 
  position: [number, number, number]; 
  material: THREE.Material;
  size?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function TexturedCube({ mousePosition }: TexturedCubeProps) {
  const cubeRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  
  // Create materials once
  const materials = useMemo(() => {
    return {
      matte: new THREE.MeshStandardMaterial({
        map: createMatteTexture(),
        roughness: 0.9,
        metalness: 0.1,
      }),
      glossy: new THREE.MeshStandardMaterial({
        map: createGlossyTexture(),
        roughness: 0.2,
        metalness: 0.8,
      }),
      hexagon: new THREE.MeshStandardMaterial({
        map: createHexagonTexture(),
        roughness: 0.7,
        metalness: 0.3,
      }),
      dots: new THREE.MeshStandardMaterial({
        map: createDotsTexture(),
        roughness: 0.8,
        metalness: 0.2,
      }),
      speckled: new THREE.MeshStandardMaterial({
        map: createSpeckledTexture(),
        roughness: 0.6,
        metalness: 0.4,
      }),
      carbon: new THREE.MeshStandardMaterial({
        map: createCarbonTexture(),
        roughness: 0.5,
        metalness: 0.5,
      }),
      grid: new THREE.MeshStandardMaterial({
        map: createGridTexture(),
        roughness: 0.7,
        metalness: 0.3,
      }),
      ax: new THREE.MeshStandardMaterial({
        map: createAXTexture(),
        roughness: 0.4,
        metalness: 0.6,
      }),
      brushed: new THREE.MeshStandardMaterial({
        map: createBrushedMetalTexture(),
        roughness: 0.4,
        metalness: 0.7,
      }),
    };
  }, []);

  // Define tile layout for a 3x3x3 Rubik's cube style
  const tiles = useMemo(() => {
    const tileData: { pos: [number, number, number]; mat: THREE.Material }[] = [];
    const offset = 1;
    const matArray = [
      materials.matte, materials.glossy, materials.hexagon,
      materials.carbon, materials.ax, materials.dots,
      materials.speckled, materials.grid, materials.brushed,
    ];
    
    // Front face (z = 1.5)
    let idx = 0;
    for (let y = 1; y >= -1; y--) {
      for (let x = -1; x <= 1; x++) {
        tileData.push({
          pos: [x * offset, y * offset, 1.5],
          mat: matArray[idx % matArray.length],
        });
        idx++;
      }
    }
    
    // Right face (x = 1.5)
    idx = 3;
    for (let y = 1; y >= -1; y--) {
      for (let z = 1; z >= -1; z--) {
        tileData.push({
          pos: [1.5, y * offset, z * offset],
          mat: matArray[idx % matArray.length],
        });
        idx++;
      }
    }
    
    // Top face (y = 1.5)
    idx = 6;
    for (let z = -1; z <= 1; z++) {
      for (let x = -1; x <= 1; x++) {
        tileData.push({
          pos: [x * offset, 1.5, z * offset],
          mat: matArray[idx % matArray.length],
        });
        idx++;
      }
    }
    
    return tileData;
  }, [materials]);

  useFrame((state) => {
    if (!cubeRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Continuous auto-rotation on multiple axes for realistic cube feel
    const baseRotationX = time * 0.15; // Slow X rotation
    const baseRotationY = time * 0.25; // Slightly faster Y rotation
    const baseRotationZ = Math.sin(time * 0.1) * 0.1; // Subtle Z wobble
    
    // Enhanced mouse influence - more dramatic response
    targetRotation.current.x = mousePosition.y * 0.4;
    targetRotation.current.y = mousePosition.x * 0.5;
    
    // Smooth interpolation with faster response
    cubeRef.current.rotation.x = THREE.MathUtils.lerp(
      cubeRef.current.rotation.x,
      baseRotationX + targetRotation.current.x,
      0.08
    );
    cubeRef.current.rotation.y = THREE.MathUtils.lerp(
      cubeRef.current.rotation.y,
      baseRotationY + targetRotation.current.y,
      0.08
    );
    cubeRef.current.rotation.z = THREE.MathUtils.lerp(
      cubeRef.current.rotation.z,
      baseRotationZ,
      0.05
    );
    
    // Enhanced floating motion - more pronounced
    cubeRef.current.position.y = Math.sin(time * 0.8) * 0.18;
    cubeRef.current.position.x = Math.sin(time * 0.5) * 0.05;
  });

  return (
    <group ref={cubeRef}>
      {/* Individual tiles */}
      {tiles.map((tile, index) => (
        <Tile key={index} position={tile.pos} material={tile.mat} />
      ))}
      
      {/* Inner dark core */}
      <mesh>
        <boxGeometry args={[2.8, 2.8, 2.8]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={1}
          metalness={0}
        />
      </mesh>
      
      {/* Subtle edge glow */}
      <mesh>
        <boxGeometry args={[3.2, 3.2, 3.2]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
