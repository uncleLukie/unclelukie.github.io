// app/components/MatrixSkybox.tsx
"use client";
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';

const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨーラリルレロワヲン0123456789+-*=<>!?#@$%&';
const CHAR_COLOR = '#cc33ff';
const FADE_COLOR = '#330066';

interface MatrixSkyboxProps {
    count?: number;
    boxSize?: number;
    fontSize?: number;
}

// --- Texture Atlas Generation ---
const createAtlasTexture = (chars: string, fontSize: number): [THREE.CanvasTexture, number, number] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('could not get 2d context');
    const charSizePx = Math.ceil(fontSize * 1.2);
    const charsPerRow = Math.ceil(Math.sqrt(chars.length));
    const charsPerCol = Math.ceil(chars.length / charsPerRow);
    canvas.width = charsPerRow * charSizePx;
    canvas.height = charsPerCol * charSizePx;
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const col = i % charsPerRow;
        const row = Math.floor(i / charsPerRow);
        const x = col * charSizePx + charSizePx / 2;
        const y = row * charSizePx + charSizePx / 2 + fontSize * 0.1;
        ctx.fillText(char, x, y);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    // console.log(`generated ${charsPerRow}x${charsPerCol} atlas`);
    return [texture, charsPerRow, charsPerCol];
};
// --- End Texture Atlas ---


// --- Shaders ---
// vertex shader: calculate changing character index based on time
const vertexShader = `
  attribute float size;
  attribute vec3 trailColor;
  attribute float speed;
  // remove charIndex attribute, we'll calculate it here
  // attribute float charIndex;

  uniform float time;
  uniform float boxHeight;
  uniform float numChars; // total number of characters in the atlas

  varying vec3 vColor;
  varying float vOpacity;
  varying float vCharIndex; // still pass an index, but calculated here

  // simple hash function to get somewhat random numbers from position/time
  // results are not perfectly distributed but good enough visually
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vColor = trailColor;

    vec3 pos = position;
    float timeScaledSpeed = time * speed * 5.0;
    float yOffset = position.y - timeScaledSpeed; // raw y offset based on time
    pos.y = mod(yOffset, boxHeight) - boxHeight / 2.0; // wrapped y position

    // --- Calculate changing character index ---
    // use the particle's initial xz position and the *unwrapped* y offset
    // change character index based on time and y position (more changes further down)
    // the 'floor(time * speed * 5.0)' makes characters 'tick' over rather than smoothly change
    // the hash adds randomness based on position
    float charChangeFactor = floor(time * speed * 20.0 + position.y * 0.1); // faster change rate
    vCharIndex = floor(hash(vec2(position.x + charChangeFactor, position.z - charChangeFactor)) * numChars);
    // --- End Character Index Calc ---

    float trailPos = mod(yOffset, boxHeight);
    vOpacity = smoothstep(0.0, boxHeight * 0.6, boxHeight - trailPos);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D atlasTexture;
  uniform vec3 baseColor;
  uniform vec2 atlasGrid;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vCharIndex;

  void main() {
    float charCol = mod(vCharIndex, atlasGrid.x);
    float charRow = floor(vCharIndex / atlasGrid.x);
    vec2 cellOffset = vec2(charCol / atlasGrid.x, 1.0 - (charRow + 1.0) / atlasGrid.y);
    vec2 charUV = cellOffset + (gl_PointCoord / atlasGrid);
    float alpha = texture2D(atlasTexture, charUV).r;
    vec3 finalColor = mix(vColor, baseColor, vOpacity);
    gl_FragColor = vec4(finalColor, alpha * vOpacity);
    if (gl_FragColor.a < 0.1) discard;
  }
`;
// --- End Shaders ---


export default function MatrixSkybox({ count = 2000, boxSize = 100, fontSize = 24 }: MatrixSkyboxProps) {
    const pointsRef = useRef<THREE.Points>(null!);

    // generate atlas
    const [atlasTexture, atlasCols, atlasRows] = useMemo(
        () => createAtlasTexture(MATRIX_CHARS, fontSize),
        [fontSize]
    );

    // generate attributes (remove charIndices, it's calculated in shader now)
    const [positions, sizes, trailColors, speeds] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const sz = new Float32Array(count);
        const tc = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        // removed cIdx = new Float32Array(count);

        const fadeColor = new THREE.Color(FADE_COLOR);
        const halfBox = boxSize / 2;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3    ] = MathUtils.randFloat(-halfBox, halfBox);
            pos[i3 + 1] = MathUtils.randFloat(-halfBox, halfBox); // initial y
            pos[i3 + 2] = MathUtils.randFloat(-halfBox, halfBox);

            sz[i] = MathUtils.randFloat(fontSize * 0.08, fontSize * 0.15);
            spd[i] = MathUtils.randFloat(0.5, 1.5);

            tc[i3    ] = fadeColor.r;
            tc[i3 + 1] = fadeColor.g;
            tc[i3 + 2] = fadeColor.b;

            // removed assignment to cIdx[i]
        }
        return [pos, sz, tc, spd]; // return attributes without charIndices
    }, [count, boxSize, fontSize]);

    // uniforms: add numChars
    const uniforms = useMemo(() => ({
        time: { value: 0.0 },
        atlasTexture: { value: atlasTexture },
        baseColor: { value: new THREE.Color(CHAR_COLOR) },
        boxHeight: { value: boxSize },
        atlasGrid: { value: new THREE.Vector2(atlasCols, atlasRows) },
        numChars: { value: MATRIX_CHARS.length } // pass total char count to shader
    }), [boxSize, atlasTexture, atlasCols, atlasRows]);

    // update time uniform
    useFrame((state) => {
        if (uniforms.time) {
            uniforms.time.value = state.clock.elapsedTime;
        }
    });


    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                {/* removed charIndex attribute */}
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
                <bufferAttribute attach="attributes-trailColor" args={[trailColors, 3]} />
                <bufferAttribute attach="attributes-speed" args={[speeds, 1]} />
            </bufferGeometry>
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                defines={{ POINT_TEXTURE: '' }}
            />
        </points>
    );
}