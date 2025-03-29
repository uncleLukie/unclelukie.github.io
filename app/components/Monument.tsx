// app/components/Monument.tsx
"use client";
import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MathUtils } from 'three';

interface MonumentProps {
    onClickAction: () => void;
    isPlaying: boolean;
    isReady: boolean;
    audioData: number[];
}

// --- material properties ---
const activeMaterialProps = { /* ... */
    color: "#E040FB",
    emissive: "#8A2BE2",
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.7,
};
const inactiveMaterialProps = { /* ... */
    color: "#cc33ff",
    emissive: "#1a0033",
    emissiveIntensity: 0.2,
    roughness: 0.4,
    metalness: 0.5,
};
// --- end material properties ---


// --- Kangaroo Model Component ---
function KangarooModel({ material, audioData, isPlaying, displacementActive }: {
    material: THREE.Material | THREE.Material[];
    audioData: number[];
    isPlaying: boolean;
    displacementActive: boolean;
}) {
    const objGroup = useLoader(OBJLoader, '/lowpolykangaroo.obj');
    const meshRef = useRef<THREE.Mesh>(null!);
    const originalPositions = useRef<Float32Array | null>(null);

    // extract the geometry and explicitly assert the type of the useMemo result
    const geometry = useMemo((): THREE.BufferGeometry | null => { // <--- Explicit return type
        let extractedGeo: THREE.BufferGeometry | null = null;
        objGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && !extractedGeo) {
                const geo = child.geometry;
                if (geo && geo.isBufferGeometry) {
                    if (!geo.attributes.normal) {
                        console.log("kangaroo obj missing normals, computing...");
                        geo.computeVertexNormals();
                    }
                    geo.center();
                    extractedGeo = geo;
                }
            }
        });
        return extractedGeo;
    }, [objGroup]);

    // store original vertex positions
    useEffect(() => {
        // now that geometry is explicitly typed, simple checks should work
        if (geometry && geometry.attributes.position && !originalPositions.current) {
            originalPositions.current = geometry.attributes.position.clone().array as Float32Array;
            console.log("stored original vertex positions kangaroo");
        }
    }, [geometry]);

    // apply displacement in useFrame
    useFrame((state) => {
        // --- initial checks ---
        // checks should now be simpler because TS trusts the type from useMemo
        if (!meshRef.current || !geometry || !displacementActive) {
            // reset logic
            if (meshRef.current && geometry && geometry.attributes.position && originalPositions.current && !displacementActive) {
                const positions = geometry.attributes.position.array as Float32Array;
                if (Math.abs(positions[0] - originalPositions.current[0]) > 0.001) {
                    positions.set(originalPositions.current);
                    geometry.attributes.position.needsUpdate = true;
                    console.log("reset kangaroo positions");
                }
            }
            return; // exit if checks fail or displacement off
        }

        // --- passed initial checks ---
        // geometry is known to be BufferGeometry here due to the earlier check

        const time = state.clock.getElapsedTime();
        let displacement = 0;

        if (isPlaying && audioData.length > 0) {
            const overallAvg = audioData.reduce((s, v) => s + v, 0) / (audioData.length * 255);
            displacement = overallAvg * 0.12 * (1 + Math.sin(time * 3 + overallAvg * 5));
        }

        // --- vertex displacement logic ---
        if (originalPositions.current && geometry.attributes.position) { // position guaranteed by initial check
            const positions = geometry.attributes.position.array as Float32Array;
            const normals = geometry.attributes.normal?.array as Float32Array | undefined;

            if (normals) {
                for (let i = 0; i < positions.length; i += 3) {
                    const origX = originalPositions.current[i];
                    const origY = originalPositions.current[i + 1];
                    const origZ = originalPositions.current[i + 2];
                    const normX = normals[i]; const normY = normals[i + 1]; const normZ = normals[i + 2];
                    positions[i] = origX + normX * displacement;
                    positions[i + 1] = origY + normY * displacement;
                    positions[i + 2] = origZ + normZ * displacement;
                }
                geometry.attributes.position.needsUpdate = true; // position guaranteed
            }
        }
        // --- end displacement ---
    });


    if (!geometry) {
        console.warn("Kangaroo geometry not found in OBJ.");
        return null;
    }

    return (
        <mesh
            ref={meshRef}
            geometry={geometry} // geometry known to be BufferGeometry or null (handled above)
            material={material}
            castShadow={true}
            scale={3.0}
            position={[0, -0.5, 0]}
            rotation={[-Math.PI / 20, 0, 0]}
        />
    );
}
// --- End Kangaroo Model Component ---


// --- Main Monument Component (no changes) ---
export default function Monument({ onClickAction, isPlaying, isReady, audioData }: MonumentProps) {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    const groupRef = useRef<THREE.Group>(null!);
    const [hovered, setHovered] = useState(false);
    const displacementActive = false; // keep false for testing

    useFrame((_state, delta) => {
        if (!materialRef.current || !groupRef.current) return;
        groupRef.current.rotation.y += delta * 0.05;
        let targetScaleValue = hovered ? 1.10 : 1.0;
        let targetEmissiveIntensity = inactiveMaterialProps.emissiveIntensity;
        let targetEmissive = inactiveMaterialProps.emissive;
        let currentTargetColor: string;
        if (isPlaying && audioData.length > 0) {
            const bass = (audioData[1] || 0) / 255;
            const midsValue = (audioData[Math.floor(audioData.length / 4)] || 0) / 255;
            const overallAvg = audioData.reduce((s, v) => s + v, 0) / (audioData.length * 255);
            targetScaleValue += bass * 0.25;
            targetEmissiveIntensity = 0.15 + midsValue * 1.5 + overallAvg * 0.5;
            targetEmissive = activeMaterialProps.emissive;
            if (hovered) {
                targetEmissiveIntensity *= 1.2;
                currentTargetColor = activeMaterialProps.color;
            } else {
                currentTargetColor = "#D896FF";
            }
        } else {
            currentTargetColor = hovered ? activeMaterialProps.color : inactiveMaterialProps.color;
        }
        groupRef.current.scale.lerp(new THREE.Vector3(targetScaleValue, targetScaleValue, targetScaleValue), 0.08);
        materialRef.current.color.lerp(new THREE.Color(currentTargetColor), 0.1);
        materialRef.current.emissiveIntensity = MathUtils.lerp(materialRef.current.emissiveIntensity, targetEmissiveIntensity, 0.1);
        materialRef.current.emissive.lerp(new THREE.Color(targetEmissive), 0.1);
    });

    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; };
    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; };
    const handleClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); if (isReady) onClickAction(); else console.log("monument clicked, audio not ready."); };

    return (
        <group
            ref={groupRef}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
        >
            <meshStandardMaterial
                ref={materialRef}
                color={inactiveMaterialProps.color}
                emissive={inactiveMaterialProps.emissive}
                emissiveIntensity={inactiveMaterialProps.emissiveIntensity}
                roughness={inactiveMaterialProps.roughness}
                metalness={inactiveMaterialProps.metalness}
            />
            {materialRef.current && (
                <Suspense fallback={null}>
                    <KangarooModel
                        material={materialRef.current}
                        audioData={audioData}
                        isPlaying={isPlaying}
                        displacementActive={displacementActive}
                    />
                </Suspense>
            )}
        </group>
    );
}