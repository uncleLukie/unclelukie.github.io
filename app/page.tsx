// app/page.tsx
"use client";
import React, { useState } from "react";
import Scene from "./components/Scene";
import AboutModal from "./components/AboutModal";
import { type LinkInfo } from "./components/HtmlLink"; // <-- import the LinkInfo type

export default function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // explicitly type the array as LinkInfo[]
    const linkItemsData: LinkInfo[] = [
        { name: 'GitHub', url: 'https://github.com/uncleLukie', type: 'link', iconName: 'FaGithub' },
        { name: 'LinkedIn', url: 'https://linkedin.com/in/unclelukie', type: 'link', iconName: 'FaLinkedin' },
        { name: 'Resume', url: '/path/to/your/resume.pdf', type: 'link', iconName: 'FaFileAlt' }, // update path
        { name: 'Email', url: 'mailto:lsjhewitt@gmail.com', type: 'link', iconName: 'FaEnvelope' },
        { name: 'Discord', url: 'https://discordapp.com/users/99079218897371136', type: 'link', iconName: 'FaDiscord' },
        { name: 'About Me', type: 'button', iconName: 'FaUserAstronaut' }, // url is optional, so it's fine here
    ];


    return (
        <main
            className="relative w-full h-screen overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(to bottom, #282828, #0a0a0a)'
            }}
        >
            {/* <Header /> no longer needed */}

            <Scene
                linkItems={linkItemsData} // <-- this assignment should now be type-correct
                onAboutClick={openModal}
            />

            <AboutModal isOpen={isModalOpen} onClose={closeModal} />
        </main>
    );
}