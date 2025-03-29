// app/components/Visualizer.tsx
"use client";
import React, { useState, useRef, useEffect, Suspense, useCallback, SetStateAction, Dispatch } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// fix: import the specific type for the OrbitControls ref
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'; // the actual type implementation
import Monument from './Monument';
import Effects from './Effects';
import Links from './Links';
import MatrixSkybox from './MatrixSkybox';

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
                console.log("audio loaded");
                if (sound.current && analyser.current && listener.current) {
                    onAudioReady({ sound: sound.current, analyser: analyser.current, listener: listener.current });
                } else { console.error("audio refs error"); }
            },
            // fix: disable eslint rule for this specific line as the param is required by the loader
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_xhr) => {
                // console.log(`${(_xhr.loaded / _xhr.total * 100).toFixed(0)}% loaded`);
            },
            (err) => { console.error('error loading audio:', err); audioLoaded.current = false; }
        );
        return () => {
            sound.current?.stop();
            // fix: disable eslint rule for this specific line as we intentionally ignore the error details
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            if (listener.current && camera?.remove) { try { camera.remove(listener.current); } catch (_e) { /* ignore */ } }
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


// --- Visualizer Component ---
export default function Visualizer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioData, setAudioData] = useState<number[]>(() => new Array(FFT_SIZE / 2).fill(0));
    const [isReady, setIsReady] = useState(false);
    const audioRefs = useRef<AudioRefs>({ sound: null, analyser: null, listener: null });
    // fix: provide the correct type for the OrbitControls ref
    const controlsRef = useRef<OrbitControlsImpl>(null); // used OrbitControlsImpl from three-stdlib

    const handleAudioReady = useCallback((refs: AudioRefs) => {
        if (!audioRefs.current.sound) {
            audioRefs.current = refs;
            setIsReady(true);
            console.log("visualizer ready");
        }
    }, []);

    const togglePlay = useCallback(() => {
        const { sound: currentSound, listener: currentListener } = audioRefs.current;
        if (!isReady || !currentSound || !currentListener) return;
        const playAction = () => {
            if (isPlaying) { currentSound.pause(); } else { if (typeof currentSound.play === 'function') currentSound.play(); }
            setIsPlaying(prev => !prev);
        };
        if (currentListener.context.state === 'suspended') {
            currentListener.context.resume().then(playAction).catch(err => console.error("resume failed", err));
        } else { playAction(); }
    }, [isPlaying, isReady]);

    const averageIntensity = audioData.reduce((sum, value) => sum + (value / 255), 0) / (audioData.length || 1);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        // make sure this only runs once on the client
        setIsMobile(window.innerWidth < 768);
    }, []);

    // update controls if damping is enabled (requires useFrame)
    // useFrame(() => {
    //     // check if ref exists AND damping is enabled before updating
    //     controlsRef.current?.update();
    // });

    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas
                style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
                camera={{ position: [0, 0.5, isMobile ? 10 : 8], fov: 60 }}
                gl={{ antialias: !isMobile, powerPreference: "high-performance", alpha: false }}
                shadows={!isMobile}
            >
                {/* lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[8, 10, 8]}
                    intensity={1.5}
                    castShadow={!isMobile}
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                    shadow-camera-far={50}
                    shadow-camera-left={-12}
                    shadow-camera-right={12}
                    shadow-camera-top={12}
                    shadow-camera-bottom={-12}
                />
                <pointLight position={[-8, -5, -8]} intensity={1.0} color="#cc33ff" />
                <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

                {/* background */}
                <Suspense fallback={null}>
                    <MatrixSkybox count={isMobile ? 800 : 2000} boxSize={isMobile ? 50 : 100} />
                </Suspense>

                {/* audio handler */}
                <AudioHandler setAudioData={setAudioData} onAudioReady={handleAudioReady} />

                {/* monument */}
                <Suspense fallback={null}>
                    <Monument
                        onClickAction={togglePlay}
                        isPlaying={isPlaying}
                        audioData={audioData}
                        isReady={isReady}
                    />
                </Suspense>

                {/* links */}
                {isReady && <Links />}

                {/* effects - conditionally rendered */}
                {isPlaying && <Effects intensity={averageIntensity} isPlaying={isPlaying} />}


                {/* controls */}
                <OrbitControls
                    ref={controlsRef} // pass the correctly typed ref
                    enablePan={false}
                    enableZoom={true}
                    minDistance={isMobile ? 5 : 4}
                    maxDistance={isMobile ? 25 : 20}
                    autoRotate={!isMobile && !isPlaying}
                    autoRotateSpeed={0.3}
                    target={[0, 0.5, 0]}
                    // enableDamping={true} // remember to uncomment useFrame loop above if you enable this
                    // dampingFactor={0.1}
                />

            </Canvas>
        </div>
    );
}