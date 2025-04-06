// app/page.tsx
"use client";
import React, { useState } from "react";
import Scene from "./components/Scene";
import Header from "./components/Header";
import Links from "./components/Links";
import AboutModal from "./components/AboutModal";

export default function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        // Keep main as the relative container with full screen height
        <main
            className="relative w-full h-screen overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(to bottom, #282828, #0a0a0a)'
            }}
        >
            {/* Keep Header and Links with their absolute positioning and z-index */}
            <Header />
            <Links onAboutClick={openModal} />

            {/* --- REMOVE the intermediate div --- */}
            {/* The Scene component's Canvas will now try to fill 'main' */}
            {/* Add positioning classes directly IF needed, but R3F often handles this */}
            {/* <div className="absolute inset-0 z-0"> */}
            <Scene />
            {/* </div> */}


            {/* Keep the modal */}
            <AboutModal isOpen={isModalOpen} onClose={closeModal} />
        </main>
    );
}