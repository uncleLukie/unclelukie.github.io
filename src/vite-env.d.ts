/// <reference types="vite/client" />
declare module 'three/examples/jsm/postprocessing/EffectComposer' {
    import { WebGLRenderer, WebGLRenderTarget } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';

    export class EffectComposer {
        constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
        addPass(pass: Pass): void;
        render(delta: number): void;
        setSize(width: number, height: number): void;
    }
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
    import { Scene, Camera } from 'three';

    export class RenderPass extends Pass {
        constructor(scene: Scene, camera: Camera);
    }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
    import { Vector2 } from 'three';

    export class UnrealBloomPass extends Pass {
        constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
        strength: number;
        radius: number;
        threshold: number;
    }
}

declare module 'three/examples/jsm/postprocessing/OutputPass' {
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';

    export class OutputPass extends Pass {
        constructor();
    }
}
