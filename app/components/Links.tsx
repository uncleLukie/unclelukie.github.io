// app/components/Links.tsx
"use client";
import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface LinkItemProps {
    href: string;
    children: React.ReactNode;
    position: THREE.Vector3 | [number, number, number];
    isVisible: boolean; // i'll keep this, even though we're always showing them now, just in case
}

const LinkItem: React.FC<LinkItemProps> = ({ href, children, position, isVisible }) => (
    <Html
        position={position}
        center
        distanceFactor={12}
        occlude // hides the link if it's behind the monument
        // making sure links are always visible and clickable now
        className={`select-none transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            // adjusted styles slightly for visibility
            className="block px-4 py-2 bg-[rgba(50,10,80,0.4)] border border-[var(--foreground)] rounded text-[var(--foreground)] hover:bg-[rgba(204,51,255,0.5)] hover:scale-105 transition-all duration-200 text-base whitespace-nowrap font-mono shadow-lg backdrop-blur-md"
            // prevent clicks if isVisible is false (belt and suspenders)
            onClick={(e) => { if (!isVisible) e.preventDefault(); }}
        >
            {children}
        </a>
    </Html>
);

// fix: no props are actually needed here now, so let's just define it as an empty object type explicitly
// this satisfies the eslint rule about empty interfaces potentially allowing anything
type LinksProps = Record<string, never>;


export default function Links({ }: LinksProps) {
    // positioning the links in a circle
    const radius = 3.0; // pushed links slightly further out
    const angleStep = (Math.PI * 2) / 5; // five links means dividing the circle into 5 parts

    const linkData = React.useMemo(() => [
        // fix: simplified angle calculations (0, 1*step, 2*step...)
        { href: "https://github.com/UncleLukie", label: "GitHub", pos: new THREE.Vector3(radius * Math.cos(0), radius * Math.sin(0), 0) },
        { href: "https://discordapp.com/users/321883318101803008", label: "Discord", pos: new THREE.Vector3(radius * Math.cos(angleStep), radius * Math.sin(angleStep), 0) },
        { href: "mailto:luke.franze@outlook.com", label: "Email", pos: new THREE.Vector3(radius * Math.cos(angleStep * 2), radius * Math.sin(angleStep * 2), 0) },
        { href: "/Luke_Franze_Resume.pdf", label: "Resume", pos: new THREE.Vector3(radius * Math.cos(angleStep * 3), radius * Math.sin(angleStep * 3), 0) },
        { href: "https://reddit.com/user/SirPrize", label: "Reddit", pos: new THREE.Vector3(radius * Math.cos(angleStep * 4), radius * Math.sin(angleStep * 4), 0) },
    ], [radius, angleStep]);

    // links are always visible now
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