import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ThreeAudioTerrain: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);

    let audioContext: AudioContext | null = null;
    let terrain: THREE.Mesh | null = null;
    let terrainOffset = 0;

    // Create the material with lighting and shading effects
    const createPhongMaterial = () => {
        return new THREE.MeshPhongMaterial({
            color: 0xFF0000,
            flatShading: true,
            shininess: 15,
            specular: 0xaaaaaa,
        });
    };

    // Function to smooth the terrain movement
    const smoothValue = (value: number, smoothFactor: number) => {
        return value * (1 - smoothFactor) + smoothFactor * 0.5;
    };

    // Function to update the terrain based on audio data
    const updateTerrain = (bassHeightFactor: number, midFreqFactor: number) => {
        if (!terrain) return;

        const positions = terrain.geometry.attributes.position.array as Float32Array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2] + terrainOffset;

            // Smooth out the noise and bass factors
            const noiseFactor = Math.sin(time + x * 0.1 + z * 0.1) * 1.5; // More subtle noise

            // Smooth bass response and mid-frequency variation
            const smoothBassFactor = smoothValue(bassHeightFactor, 0.3);
            const smoothMidFactor = smoothValue(midFreqFactor, 0.2);

            // Update the Y position based on smoother bass and reduced noise
            positions[i + 1] = Math.sin(x * 0.15 + z * 0.15) * smoothBassFactor * 2 + noiseFactor;

            // Slight variation in X direction using mid-frequencies
            positions[i] += Math.cos(time + z * 0.1) * smoothMidFactor * 0.5;
        }

        terrain.geometry.attributes.position.needsUpdate = true;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const audio = audioRef.current;
        if (!canvas || !audio) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 1);
        renderer.shadowMap.enabled = true;
        canvas.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x750000, 0.4);  // Soft ambient light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x750000, 20);
        directionalLight.position.set(0, 500, 100);
        directionalLight.castShadow = true; // Enable shadows
        scene.add(directionalLight);

        // Camera settings
        camera.position.z = 150;
        camera.position.y = 100;
        camera.lookAt(0, 0, 0);

        // Create terrain geometry
        const gridSize = 64;
        const terrainWidth = 100;
        const terrainDepth = 200;
        const terrainGeometry = new THREE.PlaneGeometry(terrainWidth, terrainDepth, gridSize, gridSize);
        terrainGeometry.rotateX(-Math.PI / 2); // Flatten it horizontally

        // Create the material and mesh
        const terrainMaterial = createPhongMaterial();
        terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.receiveShadow = true;  // Allow the terrain to receive shadows
        scene.add(terrain);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            terrainOffset += 0.05;  // Reduce forward movement speed for smoother effect
            renderer.render(scene, camera);
        };
        animate();

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.dispose();
        };
    }, []);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!audioContext) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContext = new AudioCtx();

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            audioContext.resume().then(() => {
                audio.play();
                setIsPlaying(true);

                const updateAudioAndTerrain = () => {
                    analyser.getByteFrequencyData(dataArray);

                    const bassFrequencies = dataArray.slice(0, 10);
                    const bassValue = bassFrequencies.reduce((a, b) => a + b) / bassFrequencies.length;
                    const bassHeightFactor = (bassValue / 256) * 15;  // Reduce bass exaggeration

                    const midFrequencies = dataArray.slice(10, 20);
                    const midFreqValue = midFrequencies.reduce((a, b) => a + b) / midFrequencies.length;
                    const midFreqFactor = (midFreqValue / 256) * 3;  // Subtle mid-frequency impact

                    updateTerrain(bassHeightFactor, midFreqFactor);
                    requestAnimationFrame(updateAudioAndTerrain);
                };

                updateAudioAndTerrain();
            }).catch(console.error);
        } else if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audioContext.resume().then(() => {
                audio.play();
                setIsPlaying(true);
            }).catch(console.error);
        }
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(event.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <>
            <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />
            <audio ref={audioRef} id="music" src="/monument.opus" />
            <div style={{ position: 'absolute', top: 20, left: 20 }}>
                <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                />
            </div>
        </>
    );
};

export default ThreeAudioTerrain;
