// app/components/Monument.tsx
"use client";
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { TorusKnot } from '@react-three/drei';

interface MonumentProps {
    onClickAction: () => void;
    isPlaying: boolean;
    isReady: boolean;
    audioData: number[];
}

const activeMaterialProps = {
    color: "#E040FB",
    emissive: "#8A2BE2",
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.7,
};

const inactiveMaterialProps = {
    color: "#cc33ff",
    emissive: "#1a0033",
    emissiveIntensity: 0.2,
    roughness: 0.4,
    metalness: 0.5,
};

export default function Monument({ onClickAction, isPlaying, isReady, audioData }: MonumentProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    const [hovered, setHovered] = useState(false);

    // FIX: Increase the radius (first argument) to make the monument bigger
    // FIX: Remove 'as const' to fix TS4104
    const geometryArgs = useMemo(() => [1.5, 0.3, 160, 20], []); // Increased radius, tube, segments

    useFrame((_state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        meshRef.current.rotation.y += delta * 0.05;
        meshRef.current.rotation.x += delta * 0.03;
        meshRef.current.rotation.z -= delta * 0.02;

        let targetScaleValue = hovered ? 1.15 : 1.0;
        let targetEmissiveIntensity = inactiveMaterialProps.emissiveIntensity;
        // FIX: Remove unused targetColor variable
        // let targetColor = inactiveMaterialProps.color;
        let targetEmissive = inactiveMaterialProps.emissive;

        // No need to set targetColor here as we lerp directly later
        // if (hovered) {
        //     targetColor = activeMaterialProps.color;
        // }

        let currentTargetColor = inactiveMaterialProps.color; // Determine target color based on hover/playing

        if (isPlaying && audioData.length > 0) {
            const bass = (audioData[1] || 0) / 255;
            const mids = (audioData[Math.floor(audioData.length / 4)] || 0) / 255;
            const highs = (audioData[Math.floor(audioData.length / 2)] || 0) / 255;

            targetScaleValue += bass * 0.35;
            targetEmissiveIntensity = 0.2 + mids * 1.5 + highs * 0.5;
            targetEmissive = activeMaterialProps.emissive;
            if (hovered) {
                targetEmissiveIntensity *= 1.2;
                currentTargetColor = activeMaterialProps.color; // Hover color takes precedence when playing
            } else {
                currentTargetColor = "#D896FF"; // Lighter purple when playing & not hovered
            }
        } else {
            // Set target color based only on hover when not playing
            currentTargetColor = hovered ? activeMaterialProps.color : inactiveMaterialProps.color;
        }

        // Lerp scale smoothly
        meshRef.current.scale.lerp(new THREE.Vector3(targetScaleValue, targetScaleValue, targetScaleValue), 0.08);

        // Lerp material properties
        materialRef.current.color.lerp(new THREE.Color(currentTargetColor), 0.1);
        materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetEmissiveIntensity, 0.1);
        materialRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1);

    });

    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setHovered(false);
        document.body.style.cursor = 'default';
    };

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (isReady) {
            onClickAction();
        } else {
            console.log("Monument clicked, but audio not ready.");
        }
    };

    return (
        <TorusKnot
            ref={meshRef}
            args={geometryArgs} // Use updated args
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            position={[0, 0.2, 0]} // Centered horizontally, slightly raised
            castShadow // Keep castShadow
        >
            <meshStandardMaterial
                ref={materialRef}
                color={inactiveMaterialProps.color}
                emissive={inactiveMaterialProps.emissive}
                emissiveIntensity={inactiveMaterialProps.emissiveIntensity}
                roughness={inactiveMaterialProps.roughness}
                metalness={inactiveMaterialProps.metalness}
                wireframe={false}
            />
        </TorusKnot>
    );
}