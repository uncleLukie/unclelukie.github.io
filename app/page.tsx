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
        <main
            className="relative w-full h-screen overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(to bottom, #282828, #0a0a0a)'
            }}
        >
            {/* --- Add a Wrapper Div for Left UI Elements --- */}
            <div className="
                absolute top-1/2 left-8 md:left-16 lg:left-24 /* Adjust left offset */
                transform -translate-y-1/2 /* Vertical centering */
                z-10 /* Ensure UI is above scene (z-0) */
                flex flex-col gap-4 md:gap-6 /* Space between Header and Links */
            ">
                {/* Header and Links go inside the wrapper */}
                <Header />
                <Links onAboutClick={openModal} />
            </div>


            {/* Keep the Scene directly in main for now, it should fill */}
            <Scene />


            {/* Keep the Modal */}
            <AboutModal isOpen={isModalOpen} onClose={closeModal} />
        </main>
    );
}