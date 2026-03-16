"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial, Text, Center } from "@react-three/drei";
import * as THREE from "three";

// Floating 2D Numbers (fallback without 3D text)
function FloatingNumber({ number, position, color = "#4f46e5" }: { number: string, position: [number, number, number], color?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5} position={position}>
            <Center>
                <Text
                    ref={meshRef}
                    fontSize={0.8}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#ffffff"
                >
                    {number}
                </Text>
            </Center>
        </Float>
    );
}

// Mathematical Symbols
function MathSymbol({ symbol, position, color = "#06b6d4" }: { symbol: string, position: [number, number, number], color?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2} position={position}>
            <Center>
                <Text
                    ref={meshRef}
                    fontSize={0.7}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#ffffff"
                    font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                >
                    {symbol}
                </Text>
            </Center>
        </Float>
    );
}

// Mathematical Formulas
function MathFormula({ formula, position, scale = 0.5 }: { formula: string, position: [number, number, number], scale?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
        }
    });

    return (
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1.2} position={position}>
            <Center>
                <Text
                    ref={meshRef}
                    fontSize={scale}
                    color="#8b5cf6"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.01}
                    outlineColor="#ffffff"
                >
                    {formula}
                </Text>
            </Center>
        </Float>
    );
}

// All Math Elements
function MathElements() {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const symbols = ['π', '∑', '∫', '√', '∞', '±', '÷', '×', 'α', 'β', 'θ', 'Δ'];
    const formulas = ['x²+y²', 'a²+b²=c²', 'E=mc²', 'f(x)', 'dy/dx', 'lim', 'sin', 'cos'];

    const colors = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <group>
            {/* Floating Numbers */}
            {numbers.map((num, i) => (
                <FloatingNumber
                    key={`num-${i}`}
                    number={num}
                    position={[
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 12,
                        (Math.random() - 0.5) * 10 - 3
                    ]}
                    color={colors[i % colors.length]}
                />
            ))}

            {/* Mathematical Symbols */}
            {symbols.map((symbol, i) => (
                <MathSymbol
                    key={`symbol-${i}`}
                    symbol={symbol}
                    position={[
                        (Math.random() - 0.5) * 18,
                        (Math.random() - 0.5) * 14,
                        (Math.random() - 0.5) * 8 - 2
                    ]}
                    color={colors[(i + 2) % colors.length]}
                />
            ))}

            {/* Mathematical Formulas */}
            {formulas.map((formula, i) => (
                <MathFormula
                    key={`formula-${i}`}
                    formula={formula}
                    position={[
                        (Math.random() - 0.5) * 16,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 6 - 4
                    ]}
                    scale={0.4 + Math.random() * 0.2}
                />
            ))}

            {/* Geometric Shapes for depth */}
            {Array.from({ length: 8 }).map((_, i) => (
                <Float
                    key={`geo-${i}`}
                    speed={0.8 + Math.random() * 0.5}
                    rotationIntensity={1.5}
                    floatIntensity={1}
                    position={[
                        (Math.random() - 0.5) * 22,
                        (Math.random() - 0.5) * 16,
                        (Math.random() - 0.5) * 12 - 6
                    ]}
                >
                    <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                        {i % 3 === 0 ? <octahedronGeometry args={[0.4]} /> :
                            i % 3 === 1 ? <icosahedronGeometry args={[0.4]} /> :
                                <torusGeometry args={[0.4, 0.12, 16, 32]} />}
                        <meshStandardMaterial
                            color={colors[i % colors.length]}
                            roughness={0.2}
                            metalness={0.8}
                            transparent
                            opacity={0.6}
                            emissive={colors[i % colors.length]}
                            emissiveIntensity={0.2}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

// Background Grid
function MathGrid() {
    const gridRef = useRef<THREE.GridHelper>(null);

    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.position.z = -5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
        }
    });

    return (
        <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -5, -10]}>
            <gridHelper args={[50, 50, "#e2e8f0", "#f1f5f9"]} />
        </group>
    );
}

// Particle field
function Particles() {
    const count = 1000;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 35;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
        }
        return pos;
    }, [count]);

    const ref = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.02;
            ref.current.rotation.z = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial transparent color="#6366f1" size={0.03} sizeAttenuation={true} depthWrite={false} opacity={0.5} />
        </Points>
    );
}

export default function MathCanvasSimple() {
    return (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <Canvas camera={{ position: [0, 0, 12], fov: 50 }} dpr={[1, 2]}>
                <color attach="background" args={["#f8fafc"]} />

                {/* Enhanced Lighting */}
                <ambientLight intensity={0.5} />
                <spotLight position={[20, 25, 15]} angle={0.3} penumbra={1} intensity={2.5} castShadow color="#ffffff" />
                <pointLight position={[-15, -10, -5]} intensity={1.8} color="#6366f1" />
                <pointLight position={[15, 10, 5]} intensity={1.5} color="#8b5cf6" />
                <pointLight position={[0, 15, 0]} intensity={1.2} color="#06b6d4" />

                <MathElements />
                <MathGrid />
                <Particles />

                <fog attach="fog" args={["#f8fafc", 12, 28]} />
            </Canvas>
        </div>
    );
}
