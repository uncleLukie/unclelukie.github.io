// app/components/Effects.tsx
"use client";
import React from 'react';
// keeping imports just in case we re-enable later
// import { EffectComposer, Glitch, Bloom } from '@react-three/postprocessing';
// import { GlitchMode } from 'postprocessing';
// import * as THREE from 'three';

interface EffectsProps {
    intensity: number;
    isPlaying: boolean;
}

// ** PERFORMANCE: completely disable effects for testing **
export default React.memo(function Effects({ /* intensity, isPlaying */ }: EffectsProps) {
    // just return nothing, no effect composer at all
    return null;

    /* // original code commented out:
    const glitchStrengthValue = isPlaying && intensity > 0.2 ? Math.pow(intensity, 1.5) * 0.4 : 0;
    const bloomIntensityValue = isPlaying && intensity > 0.15 ? 0.1 + intensity * 1.5 : 0.05;
    const delay = React.useMemo(() => new THREE.Vector2(0.4, 1.0), []);
    const duration = React.useMemo(() => new THREE.Vector2(0.1, 0.3), []);
    const strength = React.useMemo(() => new THREE.Vector2(glitchStrengthValue * 0.4, glitchStrengthValue * 0.8), [glitchStrengthValue]);

    if (!isPlaying && intensity < 0.05) {
        return null;
    }
    return (
        <EffectComposer>
            <Bloom ... />
            <Glitch ... />
        </EffectComposer>
    );
    */
});