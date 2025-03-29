// app/components/Links.tsx
"use client";
import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface LinkItemProps {
    href: string;
    children: React.ReactNode;
    position: THREE.Vector3 | [number, number, number];
    isVisible: boolean; // Keep isVisible for the CSS class logic
}

const LinkItem: React.FC<LinkItemProps> = ({ href, children, position, isVisible }) => (
    <Html
        position={position}
        center
        distanceFactor={12}
        occlude
        // Always apply opacity-100 if links should always be visible
        // The transition class remains for potential future use or smoothness
        className={`select-none transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 bg-[rgba(50,10,80,0.3)] border border-[var(--foreground)] rounded text-[var(--foreground)] hover:bg-[rgba(204,51,255,0.4)] hover:scale-105 transition-all duration-200 text-base whitespace-nowrap font-mono shadow-lg backdrop-blur-md"
            onClick={(e) => { if (!isVisible) e.preventDefault(); }}
        >
            {children}
        </a>
    </Html>
);

// Remove isPlaying prop if it's no longer needed to determine visibility
interface LinksProps {
    // No props needed if always visible based on isReady state in parent
}

// Removed isPlaying from function parameters
export default function Links({ }: LinksProps) {
    const radius = 2.8;
    const angleStep = (Math.PI * 2) / 5;

    const linkData = React.useMemo(() => [
        // Corrected the angle calculation (multiplying by index)
        { href: "https://github.com/UncleLukie", label: "GitHub", pos: new THREE.Vector3(radius * Math.cos(angleStep * 0), radius * Math.sin(angleStep * 0), 0) },
        { href: "https://discordapp.com/users/321883318101803008", label: "Discord", pos: new THREE.Vector3(radius * Math.cos(angleStep * 1), radius * Math.sin(angleStep * 1), 0) },
        { href: "mailto:luke.franze@outlook.com", label: "Email", pos: new THREE.Vector3(radius * Math.cos(angleStep * 2), radius * Math.sin(angleStep * 2), 0) },
        { href: "/Luke_Franze_Resume.pdf", label: "Resume", pos: new THREE.Vector3(radius * Math.cos(angleStep * 3), radius * Math.sin(angleStep * 3), 0) },
        { href: "https://reddit.com/user/SirPrize", label: "Reddit", pos: new THREE.Vector3(radius * Math.cos(angleStep * 4), radius * Math.sin(angleStep * 4), 0) },
    ], [radius, angleStep]); // Added angleStep dependency

    // FIX: Set links to always be visible
    const areLinksVisible = true;

    return (
        <>
            {linkData.map(link => (
                <LinkItem key={link.href} href={link.href} position={link.pos} isVisible={areLinksVisible}>
                    {link.label}
                </LinkItem>
            ))}
        </>
    );
}