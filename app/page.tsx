// app/page.tsx
"use client";
import React from "react";
import Scene from "./components/Scene"; 

export default function HomePage() {
    return (
        <main
            className="relative w-full h-screen overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(to bottom, #282828, #0a0a0a)'
            }}
        >
            <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl md:text-3xl z-10 text-[var(--foreground)] font-mono pointer-events-none">
                {/* uncleLukie*/}
            </h1>
            <Scene />
        </main>
    );
}