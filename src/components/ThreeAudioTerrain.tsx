import React, {useEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass';
import {GUI} from 'dat.gui';

const ThreeAudioTerrain: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const bloomComposerRef = useRef<EffectComposer | null>(null);
    const analyserRef = useRef<THREE.AudioAnalyser | null>(null);
    const soundRef = useRef<THREE.Audio | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);

    let audioContext: AudioContext | null = null;

    const params = useMemo(() => ({
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        threshold: 0.5,
        strength: 0.5,
        radius: 0.8,
    }), []);

    const uniformsRef = useRef({
        u_time: { value: 0.0 },
        u_frequency: { value: 0.0 },
        u_red: { value: 1.0 },
        u_green: { value: 1.0 },
        u_blue: { value: 1.0 },
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        canvas.appendChild(renderer.domElement);

        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.strength, params.radius, params.threshold);
        const bloomComposer = new EffectComposer(renderer);
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);
        bloomComposer.addPass(new OutputPass());
        bloomComposerRef.current = bloomComposer;

        // Shader Material for the 3D object
        const mat = new THREE.ShaderMaterial({
            uniforms: uniformsRef.current,
            vertexShader: `
                uniform float u_time;
                uniform float u_frequency;
                varying vec3 vNormal;
                void main() {
                    float frequencyEffect = u_frequency / 256.0;
                    vec3 newPosition = position + normal * frequencyEffect;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                    vNormal = normal;
                }
            `,
            fragmentShader: `
                uniform float u_red;
                uniform float u_green;
                uniform float u_blue;
                varying vec3 vNormal;
                void main() {
                    gl_FragColor = vec4(u_red, u_green, u_blue, 1.0);
                }
            `,
            wireframe: true,
        });

        // Geometry for the 3D object
        const geo = new THREE.IcosahedronGeometry(4, 30);
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        // Position camera outside the object
        camera.position.set(0, 0, 15);
        camera.lookAt(0, 0, 0);

        // GUI controls for colors and bloom effect
        const gui = new GUI();
        const colorsFolder = gui.addFolder('Colors');
        colorsFolder.add(params, 'red', 0, 1).onChange((value) => uniformsRef.current.u_red.value = Number(value));
        colorsFolder.add(params, 'green', 0, 1).onChange((value) => uniformsRef.current.u_green.value = Number(value));
        colorsFolder.add(params, 'blue', 0, 1).onChange((value) => uniformsRef.current.u_blue.value = Number(value));

        const bloomFolder = gui.addFolder('Bloom');
        bloomFolder.add(params, 'threshold', 0, 1).onChange((value) => bloomPass.threshold = Number(value));
        bloomFolder.add(params, 'strength', 0, 3).onChange((value) => bloomPass.strength = Number(value));
        bloomFolder.add(params, 'radius', 0, 1).onChange((value) => bloomPass.radius = Number(value));

        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
            const delta = clock.getDelta();
            uniformsRef.current.u_time.value = clock.getElapsedTime();

            // Update frequency for visual effects based on analyser
            if (analyserRef.current) {
                const dataArray = analyserRef.current.getFrequencyData();  // Retrieve the frequency data directly from the analyser

                // Calculate the average frequency from the analyser data
                uniformsRef.current.u_frequency.value = dataArray.reduce((a: number, b: number) => a + b, 0) / dataArray.length;  // Pass the average frequency to the shader
            }

            bloomComposer.render(delta);
            requestAnimationFrame(animate);
        };
        animate();

        // Handle window resize
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            bloomComposer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.dispose();
        };
    }, [params]);

    const handlePlayPause = () => {
        if (!audioContext) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContext = new AudioCtx();

            const listener = new THREE.AudioListener();
            const sound = new THREE.Audio(listener);
            soundRef.current = sound;

            const audioLoader = new THREE.AudioLoader();
            audioLoader.load('/monument.mp3', function (buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(true);
                sound.play();
                setIsPlaying(true);

                // Setup analyser
                analyserRef.current = new THREE.AudioAnalyser(sound, 256);  // Set up the analyser to read frequency data
            });
        } else if (isPlaying) {
            soundRef.current?.pause();
            setIsPlaying(false);
        } else {
            soundRef.current?.play();
            setIsPlaying(true);
        }
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(event.target.value);
        setVolume(newVolume);
        if (soundRef.current) {
            soundRef.current.setVolume(newVolume);
        }
    };

    return (
        <>
            <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />
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
