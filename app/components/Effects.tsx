// app/components/Effects.tsx
"use client";
import React from 'react';
// Import specific effects and composer as needed
import { EffectComposer, Glitch, Bloom, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { GlitchMode, BlendFunction } from 'postprocessing'; // Import BlendFunction for Noise
import * as THREE from 'three';

interface EffectsProps {
    intensity: number;
    isPlaying: boolean;
}

export default React.memo(function Effects({ intensity, isPlaying }: EffectsProps) {

    // Increase sensitivity / multipliers for effects
    const glitchStrengthValue = isPlaying && intensity > 0.1 ? Math.pow(intensity, 1.5) * 0.8 : 0; // Lower threshold, increase power/multiplier
    const bloomIntensityValue = isPlaying && intensity > 0.05 ? 0.2 + intensity * 3.0 : 0.1; // Lower threshold, higher multiplier, keep base bloom low
    const noiseIntensity = isPlaying ? intensity * 0.15 : 0.05; // Noise based on intensity
    const chromaticAberrationOffset = intensity * 0.01; // Subtle chromatic aberration based on intensity


    // Memoize vectors/values unconditionally
    const delay = React.useMemo(() => new THREE.Vector2(0.2, 0.8), []); // Shorter delay range
    const duration = React.useMemo(() => new THREE.Vector2(0.1, 0.2), []); // Shorter duration
    const strength = React.useMemo(() => new THREE.Vector2(glitchStrengthValue * 0.6, glitchStrengthValue), [glitchStrengthValue]);
    const chromaticAberrationVec = React.useMemo(() => new THREE.Vector2(chromaticAberrationOffset, chromaticAberrationOffset * 0.75), [chromaticAberrationOffset]);

    // No effects needed if not playing *and* intensity is very low
    // Keep a minimal composer running for base bloom if desired?
    // if (!isPlaying && intensity < 0.05) {
    //    return null; // Or return base bloom only
    // }

    return (
        <EffectComposer multisampling={4}>
            <Bloom
                intensity={bloomIntensityValue}
                luminanceThreshold={0.15} // Lower threshold makes more things bloom
                luminanceSmoothing={0.7}
                height={480} // Increase height for better quality bloom
                mipmapBlur
            />
            <Glitch
                delay={delay}
                duration={duration}
                strength={strength}
                mode={GlitchMode.SPORADIC}
                active={glitchStrengthValue > 0.01} // Only activate if strength is noticeable
                ratio={0.3} // Lower ratio for more frequent strong glitches
            />
            <Noise
                premultiply // Improves noise blending
                blendFunction={BlendFunction.SCREEN} // Or try ADD, OVERLAY
                opacity={noiseIntensity} // Control noise opacity with audio
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={chromaticAberrationVec} // Control offset with audio
            />

        </EffectComposer>
    );
});