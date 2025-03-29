// app/page.tsx
"use client";
import React from "react";
import Visualizer from "./components/Visualizer"; // verify path

export default function HomePage() {
    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            {/* just a title overlay */}
            <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl md:text-3xl z-10 text-[var(--foreground)] font-mono pointer-events-none">
                {/* // UNCLELUKIE // */}
            </h1>
            <Visualizer />
        </main>
    );
}