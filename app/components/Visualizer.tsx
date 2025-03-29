// app/components/Visualizer.tsx
"use client";
import React, { useState, useRef, useEffect, Suspense, useCallback, SetStateAction, Dispatch } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars } from '@react-three/drei'; // Ensure OrbitControls, Stars are imported if used
import Monument from './Monument';
import Effects from './Effects';
import Links from './Links';

const AUDIO_URL = '/monument.ogg';
const FFT_SIZE = 128;

interface AudioRefs {
    sound: THREE.Audio | null;
    analyser: THREE.AudioAnalyser | null;
    listener: THREE.AudioListener | null;
}
interface AudioHandlerProps {
    setAudioData: Dispatch<SetStateAction<number[]>>;
    onAudioReady: (refs: AudioRefs) => void;
}

const AudioHandler: React.FC<AudioHandlerProps> = ({ setAudioData, onAudioReady }) => {
    // ... (AudioHandler code remains the same)
    const { camera } = useThree();
    const sound = useRef<THREE.Audio | null>(null);
    const analyser = useRef<THREE.AudioAnalyser | null>(null);
    const listener = useRef<THREE.AudioListener | null>(null);
    const audioLoaded = useRef(false);

    useEffect(() => {
        if (audioLoaded.current) return;

        const audioListener = new THREE.AudioListener();
        camera.add(audioListener);
        listener.current = audioListener;

        const audio = new THREE.Audio(audioListener);
        sound.current = audio;

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(AUDIO_URL, (buffer) => {
                audio.setBuffer(buffer);
                audio.setLoop(true);
                audio.setVolume(0.5);
                analyser.current = new THREE.AudioAnalyser(audio, FFT_SIZE);
                audioLoaded.current = true;
                console.log("Audio loaded and analyser ready");
                if (sound.current && analyser.current && listener.current) {
                    onAudioReady({ sound: sound.current, analyser: analyser.current, listener: listener.current });
                } else { console.error("Audio refs error post-load."); }
            },
            (xhr) => { console.log(`${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`); },
            (err) => { console.error('Error loading audio:', err); audioLoaded.current = false; }
        );

        return () => {
            console.log("Cleaning up audio handler...");
            sound.current?.stop();
            if (listener.current && camera?.remove) {
                try { camera.remove(listener.current); console.log("AudioListener removed."); }
                catch (e) { console.error("Error removing AudioListener:", e) }
            } else { console.log("Listener/camera.remove N/A."); }
            audioLoaded.current = false;
        };
    }, [camera, onAudioReady]);

    useFrame(() => {
        if (analyser.current && sound.current?.isPlaying) {
            const data = analyser.current.getFrequencyData();
            setAudioData(Array.from(data));
        }
    });

    return null;
};


export default function Visualizer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioData, setAudioData] = useState<number[]>(() => new Array(FFT_SIZE / 2).fill(0));
    const [isReady, setIsReady] = useState(false);
    const audioRefs = useRef<AudioRefs>({ sound: null, analyser: null, listener: null });

    const handleAudioReady = useCallback((refs: AudioRefs) => {
        if (!audioRefs.current.sound) {
            audioRefs.current = refs;
            setIsReady(true);
            console.log("Visualizer received audio refs, ready state set.");
        }
    }, []);

    const togglePlay = useCallback(() => {
        // ... (togglePlay logic remains the same)
        const { sound: currentSound, listener: currentListener } = audioRefs.current;
        if (!isReady || !currentSound || !currentListener) {
            console.warn("Audio system not ready. Cannot toggle play.");
            return;
        }
        const playAction = () => {
            if (isPlaying) {
                currentSound.pause(); console.log("Audio paused.");
            } else {
                if (typeof currentSound.play === 'function') {
                    currentSound.play(); console.log("Audio playing.");
                } else { console.error("sound.play is not available"); }
            }
            setIsPlaying(prev => !prev);
        };
        if (currentListener.context.state === 'suspended') {
            console.log("Audio context suspended, resuming...");
            currentListener.context.resume()
                .then(() => { console.log("Audio context resumed."); playAction(); })
                .catch(err => console.error("Error resuming audio context:", err));
        } else { playAction(); }
    }, [isPlaying, isReady]);

    const averageIntensity = audioData.reduce((sum, value) => sum + (value / 255), 0) / (audioData.length || 1);

    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas
                style={{ width: '100%', height: '100%', display: 'block', background: '#000' }} // Explicit background
                camera={{ position: [0, 0.5, 8], fov: 60 }} // Slightly raised camera, bit further back
                gl={{ antialias: true, alpha: false }} // Alpha false if background is set
                shadows // Ensure shadows are enabled on Canvas
            >
                {/* Lights */}
                <ambientLight intensity={0.4} />
                {/* FIX: Add explicit boolean value for castShadow */}
                <directionalLight
                    position={[8, 10, 8]} // Adjust angle slightly
                    intensity={1.5}
                    castShadow={true} // Explicit boolean
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                    shadow-camera-far={50} // Optional: Adjust shadow camera frustum
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
                <pointLight position={[-8, -5, -8]} intensity={1.0} color="#cc33ff" />
                <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

                {/* Background */}
                <Stars radius={150} depth={60} count={5000} factor={5} saturation={0} fade speed={0.5} />

                {/* Audio Handler */}
                <Suspense fallback={null}>
                    <AudioHandler setAudioData={setAudioData} onAudioReady={handleAudioReady} />
                </Suspense>

                {/* Monument */}
                <Suspense fallback={null}>
                    <Monument
                        onClickAction={togglePlay}
                        isPlaying={isPlaying}
                        audioData={audioData}
                        isReady={isReady}
                    />
                </Suspense>

                {/* Links - Render when ready, no isPlaying prop needed */}
                {/* FIX: Removed isPlaying prop from Links call */}
                {isReady && <Links />}

                {/* Effects */}
                {/* Conditionally render Effects or ensure it handles isPlaying=false gracefully */}
                <Effects intensity={averageIntensity} isPlaying={isPlaying} />

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={4} // Adjust min distance for bigger monument
                    maxDistance={20} // Adjust max distance
                    autoRotate={!isPlaying}
                    autoRotateSpeed={0.3} // Slower rotation
                    target={[0, 0.5, 0]} // Target camera slightly above origin if monument is raised
                />

                {/* Ground Plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow> {/* Lowered ground plane */}
                    <planeGeometry args={[50, 50]} />
                    {/* Darker, less reflective ground */}
                    <meshStandardMaterial color="#080808" roughness={0.8} metalness={0.2} />
                </mesh>

            </Canvas>
        </div>
    );
}