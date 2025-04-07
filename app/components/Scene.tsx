// src/components/Scene.tsx

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three'; // <--- add this import
import SwordModel from './SwordModel';
import HtmlLink, { type LinkInfo } from './HtmlLink';

interface SceneProps {
    linkItems: LinkInfo[];
    onAboutClick: () => void;
}

// component for the main animated group
const AnimatedGroup: React.FC<{children: React.ReactNode, modelYPosition: number}> = ({ children, modelYPosition }) => {
    // the THREE.Group type should now be recognized
    const groupRef = useRef<THREE.Group>(null!);

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        groupRef.current.position.y = modelYPosition + Math.sin(elapsedTime * 1.5) * 0.1;
    });

    return (
        <group ref={groupRef} position={[0, modelYPosition, 0]}>
            {children}
        </group>
    );
}


const Scene: React.FC<SceneProps> = ({ linkItems, onAboutClick }) => {
    const modelXPosition = 0;
    const modelYPosition = -0.5;

    const leftLinks = linkItems.slice(0, Math.ceil(linkItems.length / 2));
    const rightLinks = linkItems.slice(Math.ceil(linkItems.length / 2));

    return (
        <Canvas
            shadows
            camera={{ position: [modelXPosition, 1.5, 7], fov: 45 }}
            className="absolute inset-0 w-full h-full block"
            style={{ background: 'transparent' }}
        >
            <fog attach="fog" args={['#0a0a0a', 7, 20]} />

            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 7, 4]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
            <directionalLight position={[-5, -3, -3]} intensity={0.4} />

            <Environment preset="night" blur={0.6} />

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
                target={[modelXPosition, modelYPosition + 1.8, 0]} // adjusted target slightly
                maxDistance={18}
                minDistance={3}
            />

            <AnimatedGroup modelYPosition={modelYPosition}>
                <Html
                    position={[0, 4.0, 0]}
                    center
                    distanceFactor={15}
                    className="pointer-events-none select-none"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-[var(--foreground)] whitespace-nowrap">
                        uncleLukie
                    </h1>
                </Html>

                <Suspense fallback={null}>
                    <SwordModel
                        modelPath="/soulsucker-sword.glb"
                        animationName="Take 001"
                        scale={1.8}
                        position={[0, 0, 0]}
                    />
                </Suspense>

                {leftLinks.map((link, index) => (
                    <HtmlLink
                        key={link.name}
                        linkInfo={link}
                        position={[-2.2, 2.8 - index * 0.9, 0]}
                        onClick={link.type === 'button' ? onAboutClick : undefined}
                    />
                ))}

                {rightLinks.map((link, index) => (
                    <HtmlLink
                        key={link.name}
                        linkInfo={link}
                        position={[2.2, (2.8 - 0.45) - index * 0.9, 0]}
                        onClick={link.type === 'button' ? onAboutClick : undefined}
                    />
                ))}

            </AnimatedGroup>

        </Canvas>
    );
};

export default Scene;