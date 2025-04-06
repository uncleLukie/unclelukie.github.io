// src/components/Scene.tsx

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import SwordModel from './SwordModel';

const Scene: React.FC = () => {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 1, 6], fov: 50 }}
            style={{ background: 'transparent' }}
        >
            <fog attach="fog" args={['#0a0a0a', 5, 15]} /> {/* matches darkest part of example gradient */}

            {/* lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight
                position={[4, 6, 3]}
                intensity={0.8}
                castShadow={true}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <directionalLight position={[-4, -4, -2]} intensity={0.2} />

            {/* environment for reflections - still useful */}
            <Environment preset="night" blur={0.7} />

            {/* controls */}
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                target={[0, -0.5, 0]}
                maxDistance={12}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.8}
            />

            {/* model */}
            <Suspense fallback={null}>
                <SwordModel
                    modelPath="/soulsucker-sword.glb"
                    animationName="Take 001"
                    scale={1.5}
                    position={[0, -2.4, 0]}
                />
            </Suspense>
        </Canvas>
    );
};

export default Scene;