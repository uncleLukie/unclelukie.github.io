// src/components/Scene.tsx

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import SwordModel from './SwordModel';

const Scene: React.FC = () => {
    const modelYPosition = 0; // Keep near origin for now

    return (
        <Canvas
            shadows
            camera={{ position: [0, 1, 5], fov: 50 }}
            style={{
                background: 'transparent', // Keep background transparent
                // Remove position: absolute, top, left from here
                width: '100%',  // Force width
                height: '100%', // Force height
                display: 'block' // Ensure it behaves as a block element
            }}
            //
            className="block w-full h-full"
        >
            {/* Keep fog */}
            <fog attach="fog" args={['#0a0a0a', 5, 15]} />

            {/* Keep lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[4, 6, 3]} intensity={1.0} castShadow={true} />
            <directionalLight position={[-4, -4, -2]} intensity={0.3} />

            {/* Keep environment */}
            <Environment preset="night" blur={0.7} />

            {/* Keep controls */}
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                target={[0, modelYPosition + 1.5, 0]}
                maxDistance={15}
                minDistance={2}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.8}
            />

            {/* Keep model */}
            <Suspense fallback={null}>
                <SwordModel
                    modelPath="/soulsucker-sword.glb"
                    animationName="Take 001"
                    scale={1.5}
                    position={[0, modelYPosition, 1]}
                />
            </Suspense>
        </Canvas>
    );
};

export default Scene;