"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

// Floating Geometric Shape
function FloatingShape({
  type,
  position,
  color,
  scale = 1
}: {
  type: string;
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 + position[0];
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 + position[1];
    }
  });

  return (
    <Float
      speed={1.5 + Math.random() * 0.5}
      rotationIntensity={0.4}
      floatIntensity={1.2}
      position={position}
    >
      <mesh ref={meshRef} scale={scale}>
        {type === "sphere" && <sphereGeometry args={[1, 32, 32]} />}
        {type === "torus" && <torusGeometry args={[1, 0.4, 16, 32]} />}
        {type === "cone" && <coneGeometry args={[1, 2, 32]} />}
        {type === "octahedron" && <octahedronGeometry args={[1]} />}
        {type === "tetrahedron" && <tetrahedronGeometry args={[1]} />}
        {type === "box" && <boxGeometry args={[1.5, 1.5, 1.5]} />}
        {type === "cylinder" && <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />}
        {type === "torusKnot" && <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />}

        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.85}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Simple Line/Path decoration
function FloatingLine({
  start,
  end,
  color
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const lineRef = useRef<any>(null);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={lineRef}>
        <Line 
          points={[start, end]} 
          color={color} 
          lineWidth={2} 
          transparent 
          opacity={0.4} 
        />
      </group>
    </Float>
  );
}

// Particle system for subtle background effect
function BackgroundParticles() {
  const count = 400;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a8c5e0"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Main scene with all elements
function ModernMathScene() {
  const shapes = [
    "sphere", "torus", "cone", "octahedron", "tetrahedron",
    "box", "cylinder", "torusKnot"
  ];

  const colors = [
    "#5B9FD8", // Blue
    "#7CB8E8", // Light Blue
    "#4A8BC2", // Medium Blue
    "#8FC9F0", // Sky Blue
    "#6BA5D5", // Soft Blue
    "#9DD4F5", // Pale Blue
  ];

  return (
    <group>
      {/* Main floating shapes */}
      {Array.from({ length: 15 }).map((_, i) => (
        <FloatingShape
          key={`shape-${i}`}
          type={shapes[i % shapes.length]}
          position={[
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 15 - 5
          ]}
          color={colors[i % colors.length]}
          scale={0.6 + Math.random() * 0.6}
        />
      ))}

      {/* Decorative lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <FloatingLine
          key={`line-${i}`}
          start={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10
          ]}
          end={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10
          ]}
          color={colors[i % colors.length]}
        />
      ))}

      {/* Small accent shapes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <FloatingShape
          key={`accent-${i}`}
          type={shapes[(i + 3) % shapes.length]}
          position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 12 - 8
          ]}
          color={colors[i % colors.length]}
          scale={0.3 + Math.random() * 0.3}
        />
      ))}

      <BackgroundParticles />
    </group>
  );
}

export default function MathCanvas() {
  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#E8F4F8] via-[#F0F8FC] to-[#E0F0F8]">
      <Canvas
        camera={{ position: [0, 0, 18], fov: 50 }}
        dpr={[1, 2]}
      >
        {/* Light blue/white background */}
        <color attach="background" args={["#EFF7FB"]} />

        {/* Soft, bright lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, 5, 5]} intensity={0.6} color="#B8D8F0" />
        <pointLight position={[10, -5, -5]} intensity={0.5} color="#A8C8E8" />
        <spotLight
          position={[0, 15, 10]}
          angle={0.5}
          penumbra={1}
          intensity={0.8}
          color="#D0E8F8"
        />

        <ModernMathScene />

        {/* Very subtle fog */}
        <fog attach="fog" args={["#EFF7FB", 20, 40]} />
      </Canvas>

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(184, 216, 240, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Decorative circles in corners (like the reference) */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full border-2 border-blue-200/30 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full border-2 border-blue-200/30 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-blue-100/20 pointer-events-none blur-xl" />
      <div className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full bg-blue-100/20 pointer-events-none blur-xl" />
    </div>
  );
}
