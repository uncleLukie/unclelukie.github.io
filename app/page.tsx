// app/page.tsx
"use client";
import React, { useState } from "react";
import Scene from "./components/Scene";       // your 3d scene
import Header from "./components/Header";     // keep the simple header for now
import AboutModal from "./components/AboutModal"; // your modal component
// import Links from "./components/Links"; // we're removing this, links move into the scene

export default function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // we need to pass link data and the modal toggle function down to the scene
    const linkItemsData = [
        // maybe define link data here or fetch it
        { name: 'GitHub', url: 'https://github.com/uncleLukie', type: 'link', iconName: 'FaGithub' },
        { name: 'LinkedIn', url: 'https://linkedin.com/in/unclelukie', type: 'link', iconName: 'FaLinkedin' },
        { name: 'Resume', url: '/path/to/your/resume.pdf', type: 'link', iconName: 'FaFileAlt' }, // update path
        { name: 'Email', url: 'mailto:lsjhewitt@gmail.com', type: 'link', iconName: 'FaEnvelope' },
        { name: 'Discord', url: 'https://discordapp.com/users/99079218897371136', type: 'link', iconName: 'FaDiscord' },
        { name: 'About Me', type: 'button', iconName: 'FaUserAstronaut' }, // maybe a cooler icon?
    ];


    return (
        <main
            className="relative w-full h-screen overflow-hidden" // keep main as the container
            style={{
                backgroundImage: 'linear-gradient(to bottom, #282828, #0a0a0a)'
            }}
        >
            {/* keep header positioned simply */}
            <Header />

            {/* remove the intermediate div, Scene will fill main via its own className */}
            <Scene
                linkItems={linkItemsData}
                onAboutClick={openModal}
            />

            {/* keep the modal */}
            <AboutModal isOpen={isModalOpen} onClose={closeModal} />
        </main>
    );
}