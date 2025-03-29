// app/components/Monument.tsx
"use client";
// fix: import useEffect from react
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { TorusKnot } from '@react-three/drei';
import { MathUtils } from 'three'; // math utils already imported, good

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

type TorusKnotArgs = [
    radius?: number,
    tube?: number,
    tubularSegments?: number,
    radialSegments?: number,
    p?: number,
    q?: number
];


export default function Monument({ onClickAction, isPlaying, isReady, audioData }: MonumentProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    const originalPositions = useRef<Float32Array | null>(null);
    const [hovered, setHovered] = useState(false);

    const geometryArgs = useMemo((): TorusKnotArgs => [1.6, 0.35, 180, 24], []);

    // runs once to store original vertex positions
    useEffect(() => {
        if (meshRef.current && meshRef.current.geometry?.attributes?.position && !originalPositions.current) {
            // added check for geometry and attributes existing before cloning
            originalPositions.current = meshRef.current.geometry.attributes.position.clone().array as Float32Array;
            console.log("stored original vertex positions");
        }
        // adding meshRef.current?.geometry as dependency ensures it runs if geometry gets swapped (unlikely here)
    }, [meshRef.current?.geometry]);


    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();

        // rotation
        meshRef.current.rotation.y += delta * 0.05;
        meshRef.current.rotation.x += delta * 0.03;
        meshRef.current.rotation.z -= delta * 0.02;

        // setup defaults
        let targetScaleValue = hovered ? 1.15 : 1.0;
        let targetEmissiveIntensity = inactiveMaterialProps.emissiveIntensity;
        let targetEmissive = inactiveMaterialProps.emissive;
        // fix: remove redundant initializer, was already fixed but double checking
        let currentTargetColor: string; // declare without initializing

        let displacement = 0;

        if (isPlaying && audioData.length > 0) {
            const bass = (audioData[1] || 0) / 255;
            const mids = (audioData[Math.floor(audioData.length / 4)] || 0) / 255;
            const highs = (audioData[Math.floor(audioData.length / 2)] || 0) / 255;
            const overallAvg = audioData.reduce((s, v) => s + v, 0) / (audioData.length * 255);

            targetScaleValue += bass * 0.45;
            targetEmissiveIntensity = 0.2 + mids * 1.8 + highs * 0.6;
            targetEmissive = activeMaterialProps.emissive;

            if (hovered) {
                targetEmissiveIntensity *= 1.2;
                currentTargetColor = activeMaterialProps.color;
            } else {
                currentTargetColor = "#D896FF";
            }
            displacement = overallAvg * 0.15 * (1 + Math.sin(time * 5 + bass * 10));
        } else {
            currentTargetColor = hovered ? activeMaterialProps.color : inactiveMaterialProps.color;
        }

        // --- vertex displacement ---
        if (originalPositions.current && meshRef.current.geometry?.attributes?.position) {
            // check attributes exist again just to be safe
            const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
            const normals = meshRef.current.geometry.attributes.normal?.array as Float32Array | undefined;

            if (normals) { // only displace if we have normals
                for (let i = 0; i < positions.length; i += 3) {
                    const origX = originalPositions.current[i];
                    const origY = originalPositions.current[i + 1];
                    const origZ = originalPositions.current[i + 2];

                    const normX = normals[i];
                    const normY = normals[i + 1];
                    const normZ = normals[i + 2];

                    positions[i] = origX + normX * displacement;
                    positions[i + 1] = origY + normY * displacement;
                    positions[i + 2] = origZ + normZ * displacement;
                }
                meshRef.current.geometry.attributes.position.needsUpdate = true;
                // maybe only compute normals less often? could save perf
                if (displacement > 0.02 && Math.random() < 0.1) { // e.g. randomly, 10% of frames when displacing
                    meshRef.current.geometry.computeVertexNormals();
                }
            }
        }
        // --- end vertex displacement ---


        // lerp values
        meshRef.current.scale.lerp(new THREE.Vector3(targetScaleValue, targetScaleValue, targetScaleValue), 0.08);
        materialRef.current.color.lerp(new THREE.Color(currentTargetColor), 0.1);
        materialRef.current.emissiveIntensity = MathUtils.lerp(materialRef.current.emissiveIntensity, targetEmissiveIntensity, 0.1);
        materialRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1);

    });

    // --- event handlers (no changes) ---
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
        if (isReady) onClickAction();
        else console.log("monument clicked, audio not ready.");
    };

    return (
        <TorusKnot
            ref={meshRef}
            args={geometryArgs}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            position={[0, 0.2, 0]}
            castShadow={true}
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