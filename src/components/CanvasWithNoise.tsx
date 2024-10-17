import React, { useEffect, useRef } from 'react';
import { Renderer } from './Renderer';
import { VolumeControls } from './VolumeControls';

const CanvasWithNoise: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const volumeRef = useRef<HTMLDivElement | null>(null);
    let freezeTime = 0;

    useEffect(() => {
        // Hashchange event handler
        const hashchange = () => {
            const freezeMatch = window.location.hash.match(/freeze=(\d+)/);
            freezeTime = freezeMatch ? +freezeMatch[1] * 1000 : 0;
        };
        window.addEventListener('hashchange', hashchange);
        hashchange();

        const canvas = canvasRef.current!;
        const audio = audioRef.current!;
        const volume = volumeRef.current!;

        // Ensure canvas, audio, and volume elements are not null
        if (!canvas || !audio || !volume) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
            throw new Error('canvas does not support context 2d');
        }

        // Main loop (rendering and updating)
        function mainloop() {
            function createRenderer() {
                const canvasRect = canvas.getBoundingClientRect();
                canvas.width = Math.max(canvasRect.width, window.innerWidth) | 0;
                canvas.height = Math.max(canvasRect.height, window.innerHeight) | 0;

                return Renderer(ctx, canvas.width, canvas.height);
            }

            let render = createRenderer();

            window.addEventListener('resize', () => {
                render = createRenderer();
            });

            const start = performance.now();

            function tick() {
                const t = freezeTime ? freezeTime : performance.now() - start;
                render(t);
                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        mainloop();
        VolumeControls(audio, volume);

        return () => {
            window.removeEventListener('hashchange', hashchange);
        };
    }, []);

    return (
        <>
            <canvas ref={canvasRef} id="canvas" />
            <audio ref={audioRef} id="music" src="/path-to-your-audio.mp3" hidden />

            {/* Controls */}
            <div id="controls">
                <div ref={volumeRef} id="volume" className="control"></div>
                <a id="github" className="control" href="https://github.com/unclelukie/" title="Visit github page"></a>
                <a id="about" className="control" href="" title="Learn more about this demo"></a>
            </div>
        </>
    );
};

export default CanvasWithNoise;
