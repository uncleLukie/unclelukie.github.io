// app/components/Effects.tsx
"use client";
import React from 'react';
// okay let's simplify effects for performance
// keeping bloom and glitch, removing noise and chromatic aberration for now
import { EffectComposer, Glitch, Bloom } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import * as THREE from 'three';

interface EffectsProps {
    intensity: number;
    isPlaying: boolean;
}

export default React.memo(function Effects({ intensity, isPlaying }: EffectsProps) {

    // tweaking multipliers for performance vs visual impact
    const glitchStrengthValue = isPlaying && intensity > 0.15 ? Math.pow(intensity, 1.5) * 0.5 : 0; // slightly higher threshold, lower multiplier
    const bloomIntensityValue = isPlaying && intensity > 0.1 ? 0.15 + intensity * 2.0 : 0.1; // higher threshold, lower multiplier, lower base bloom

    // memoize vectors/values
    const delay = React.useMemo(() => new THREE.Vector2(0.3, 0.9), []); // adjusted range
    const duration = React.useMemo(() => new THREE.Vector2(0.1, 0.25), []); // adjusted range
    const strength = React.useMemo(() => new THREE.Vector2(glitchStrengthValue * 0.5, glitchStrengthValue), [glitchStrengthValue]);


    // if not playing and intensity is super low, we can probably skip rendering effects entirely
    if (!isPlaying && intensity < 0.05) {
        return null;
    }

    return (
        // removed multisampling, can be expensive
        <EffectComposer>
            {/* bloom is often the heaviest effect, let's reduce quality */}
            <Bloom
                intensity={bloomIntensityValue}
                luminanceThreshold={0.2} // slightly higher threshold might help perf
                luminanceSmoothing={0.8}
                height={300} // reduced height from 480 for better performance
                mipmapBlur // keep mipmapBlur, it helps quality without much cost
            />
            {/* glitch is usually less heavy */}
            <Glitch
                delay={delay}
                duration={duration}
                strength={strength}
                mode={GlitchMode.SPORADIC}
                active={glitchStrengthValue > 0.01}
                ratio={0.4} // adjusted ratio slightly
            />
            {/*
             removed noise and chromatic aberration for now to improve performance

            <Noise
                premultiply
                blendFunction={BlendFunction.SCREEN}
                opacity={noiseIntensity}
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={chromaticAberrationVec}
            />
            */}
        </EffectComposer>
    );
});