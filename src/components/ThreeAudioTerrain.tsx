// src/components/ThreeAudioTerrain.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ThreeAudioTerrain: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1); // Default volume to 1 (100%)

    let audioContext: AudioContext | null = null;
    let terrain: THREE.Mesh | null = null;
    let terrainOffset = 0; // For forward movement
    let paletteIndex = 0; // Track the current palette

    // Define the new color palette based on the colors you provided
    const palettes = [
        { top: 0x0f0606, bottom: 0x200b0b },  // Dark Red to Slightly Darker Red
        { top: 0x2f0000, bottom: 0x490000 },  // Red gradient
        { top: 0x490000, bottom: 0x650000 }   // Deeper Red gradient
    ];

    const backgroundMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(palettes[0].top) },
            bottomColor: { value: new THREE.Color(palettes[0].bottom) },
            offset: { value: 100 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize( vWorldPosition ).y;
                gl_FragColor = vec4( mix( bottomColor, topColor, max( h, 0.0 ) ), 1.0 );
            }
        `,
        side: THREE.BackSide,
        depthWrite: false
    });

    const skyBox = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 15), backgroundMaterial);

    // Function to update the terrain based on bass frequencies
    const updateTerrain = (bassHeightFactor: number) => {
        if (!terrain) return;

        const positions = terrain.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2] + terrainOffset; // Offset for forward motion

            // Amplify the wave height and modify the height (Y position) based on bass value
            positions[i + 1] = Math.sin(x * 0.15 + z * 0.15) * bassHeightFactor * 3; // Amplified response
        }

        // Mark vertices as needing an update
        terrain.geometry.attributes.position.needsUpdate = true;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const audio = audioRef.current;
        if (!canvas || !audio) return;

        // Set up Three.js scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 1);  // Ensure the canvas is cleared
        canvas.appendChild(renderer.domElement);

        // Add skybox with gradient shader material
        scene.add(skyBox);

        // Set up lighting
        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        light.position.set(0, 200, 0);
        scene.add(light);

        // Camera positioning
        camera.position.z = 150;
        camera.position.y = 100;
        camera.lookAt(0, 0, 0);

        // Terrain settings
        const gridSize = 64;
        const terrainWidth = 100;
        const terrainDepth = 200;
        const terrainGeometry = new THREE.PlaneGeometry(terrainWidth, terrainDepth, gridSize, gridSize);

        // Rotate the terrain so it lies flat
        terrainGeometry.rotateX(-Math.PI / 2);

        const terrainMaterial = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: 0x6a0dad, // Purple color for synthwave
        });

        terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        scene.add(terrain);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            terrainOffset += 0.1; // Move terrain forward

            // Gradually change the color palette over time
            const time = Date.now() * 0.0005;
            const currentPalette = palettes[paletteIndex % palettes.length];
            const nextPalette = palettes[(paletteIndex + 1) % palettes.length];

            const lerpFactor = Math.sin(time) * 0.5 + 0.5;
            backgroundMaterial.uniforms.topColor.value.lerpColors(
                new THREE.Color(currentPalette.top),
                new THREE.Color(nextPalette.top),
                lerpFactor
            );
            backgroundMaterial.uniforms.bottomColor.value.lerpColors(
                new THREE.Color(currentPalette.bottom),
                new THREE.Color(nextPalette.bottom),
                lerpFactor
            );

            // Update the current palette index if needed
            if (lerpFactor >= 1.0) {
                paletteIndex++;
            }

            // Render the scene
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
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
            // Initialize the audio context
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContext = new AudioCtx();

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            audioContext.resume()
                .then(() => {
                    audio.play().catch((error) => console.error('Error playing audio:', error));
                    setIsPlaying(true);

                    const updateAudioAndTerrain = () => {
                        analyser.getByteFrequencyData(dataArray);

                        // Focus on bass frequencies (first 10 values)
                        const bassFrequencies = dataArray.slice(0, 10);
                        const bassValue = bassFrequencies.reduce((a, b) => a + b) / bassFrequencies.length;
                        const bassHeightFactor = (bassValue / 256) * 20; // Scale to exaggerate the bass effect

                        // Update the terrain based on the bass height factor
                        updateTerrain(bassHeightFactor);

                        requestAnimationFrame(updateAudioAndTerrain);
                    };

                    updateAudioAndTerrain();
                })
                .catch((error) => console.error('Error resuming audio context:', error));
        } else if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audioContext.resume()
                .then(() => {
                    audio.play().catch((error) => console.error('Error playing audio:', error));
                    setIsPlaying(true);
                })
                .catch((error) => console.error('Error resuming audio context:', error));
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
