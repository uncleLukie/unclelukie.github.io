// src/components/SwordModel.tsx

import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

interface SwordGLTFResult extends GLTF {
    nodes: {
        [name: string]: THREE.Mesh | THREE.SkinnedMesh | THREE.Object3D;
    };
    materials: {
        [name: string]: THREE.Material;
    };
}

interface SwordModelProps {
    modelPath: string;
    animationName?: string;
    scale?: number | [number, number, number];
    position?: [number, number, number];
}

const SwordModel: React.FC<SwordModelProps> = ({
                                                   modelPath,
                                                   animationName = 'Take 001',
                                                   scale = 1,
                                                   position = [0, 0, 0],
                                               }) => {
    const group = useRef<THREE.Group>(null); // ref for the container group
    
    console.log(`[SwordModel] Attempting to load: ${modelPath}`);
    const { scene, animations } = useGLTF(modelPath) as SwordGLTFResult;
    console.log('[SwordModel] GLTF loaded.');
    console.log('[SwordModel] Scene object:', scene);
    console.log(`[SwordModel] Found ${animations.length} animations in data:`, animations.map(a => a.name));
    
    const { actions } = useAnimations(animations, group);
    console.log('[SwordModel] useAnimations hook processed. Actions object:', actions);
    if (actions) {
        console.log(`[SwordModel] Does actions object have key "${animationName}"?`, actions.hasOwnProperty(animationName));
    }

    
    useEffect(() => {
        console.log(`[SwordModel] useEffect triggered for animation: "${animationName}"`);
        console.log('[SwordModel] Current actions object in useEffect:', actions)
        
        console.log('[SwordModel] group.current:', group.current);


        if (actions && animationName && actions[animationName]) {
            console.log(`[SwordModel] Found action "${animationName}". Attempting to play...`);
            try {
                const action = actions[animationName];
                if (action) {
                    action.reset().fadeIn(0.5).play();
                    console.log(`[SwordModel] .play() called successfully for "${animationName}".`);
                } else {
                    console.error(`[SwordModel] Action "${animationName}" is unexpectedly undefined after check.`);
                }
            } catch (error) {
                console.error(`[SwordModel] Error during animation play for "${animationName}":`, error);
            }
        } else {
            console.warn(`[SwordModel] Condition not met to play animation. Name: "${animationName}", Action found?: ${!!(actions && actions[animationName])}`);
            if (!actions) console.warn('[SwordModel] > actions object is null/undefined.');
            else if (!animationName) console.warn('[SwordModel] > animationName prop is missing.');
            else if (!actions[animationName]) console.warn(`[SwordModel] > key "${animationName}" not found in actions object. Available keys: ${Object.keys(actions).join(', ')}`);
        }
        
        return () => {
            if (actions && animationName && actions[animationName]) {
                console.log(`[SwordModel] useEffect cleanup: Fading out "${animationName}".`);
                const action = actions[animationName];
                action?.fadeOut(0.5);
            }
        };
    }, [actions, animationName, animations]);
    

    console.log('[SwordModel] Rendering original scene directly inside group.');
    return (
        <group ref={group} dispose={null} position={position} scale={scale}>
            {scene && <primitive object={scene} />}
        </group>
    );
};

// Preload remains useful
useGLTF.preload('/soulsucker-sword.glb');

export default SwordModel;