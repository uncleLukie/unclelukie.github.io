// src/components/Scene.tsx

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import SwordModel from './SwordModel'; // assuming swordmodel is okay
import HtmlLink, { type LinkInfo } from './HtmlLink'; // import the new html link

// define props for the Scene
interface SceneProps {
    linkItems: LinkInfo[];
    onAboutClick: () => void;
}

const Scene: React.FC<SceneProps> = ({ linkItems, onAboutClick }) => {
    // center the model
    const modelXPosition = 0;
    const modelYPosition = -0.5; // adjust vertical placement

    // split links for left and right side
    const leftLinks = linkItems.slice(0, Math.ceil(linkItems.length / 2));
    const rightLinks = linkItems.slice(Math.ceil(linkItems.length / 2));

    return (
        <Canvas
            shadows
            camera={{ position: [modelXPosition, 1.5, 7], fov: 45 }} // adjust camera for new layout
            className="absolute inset-0 w-full h-full block"
            style={{ background: 'transparent' }}
        >
            <fog attach="fog" args={['#0a0a0a', 7, 20]} /> {/* adjusted fog */}

            {/* lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 7, 4]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
            <directionalLight position={[-5, -3, -3]} intensity={0.4} />

            {/* environment */}
            <Environment preset="night" blur={0.6} />

            {/* controls - UNLOCKED for testing, relock if needed */}
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true} // re-enable rotation for viewing
                target={[modelXPosition, modelYPosition + 1.0, 0]} // aim higher up the sword maybe?
                maxDistance={18}
                minDistance={3}
                // maybe relax angle limits for viewing
                // minPolarAngle={Math.PI / 4}
                // maxPolarAngle={Math.PI / 1.8}
            />

            {/* group to hold sword and links together */}
            <group position={[modelXPosition, modelYPosition, 0]}>
                {/* model */}
                <Suspense fallback={null}>
                    <SwordModel
                        modelPath="/soulsucker-sword.glb"
                        animationName="Take 001"
                        scale={1.8}
                        position={[0, 0, 0]} // position is now controlled by the parent group
                    />
                </Suspense>

                {/* render html links attached to this group */}
                {/* left side links */}
                {leftLinks.map((link, index) => (
                    <HtmlLink
                        key={link.name}
                        linkInfo={link}
                        // position links relative to the group's origin (sword base)
                        // arrange vertically, offset left
                        position={[-2.0, 2.5 - index * 0.8, 0]} // adjust x, y offset and y spacing (0.8)
                        onClick={link.type === 'button' ? onAboutClick : undefined}
                    />
                ))}

                {/* right side links */}
                {rightLinks.map((link, index) => (
                    <HtmlLink
                        key={link.name}
                        linkInfo={link}
                        // position links relative to the group's origin (sword base)
                        // arrange vertically, offset right
                        position={[2.0, (2.5 - 0.4) - index * 0.8, 0]} // adjust x, y offset and y spacing, start slightly lower
                        onClick={link.type === 'button' ? onAboutClick : undefined}
                    />
                ))}

            </group> {/* end of sword + links group */}

        </Canvas>
    );
};

export default Scene;