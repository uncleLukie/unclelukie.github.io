// src/components/HtmlLink.tsx
import React from 'react';
import { Html } from '@react-three/drei';
import * as FaIcons from 'react-icons/fa';

export interface LinkInfo {
    name: string;
    url?: string;
    type: 'link' | 'button';
    iconName: keyof typeof FaIcons;
}

interface HtmlLinkProps {
    linkInfo: LinkInfo;
    position: [number, number, number];
    onClick?: () => void;
}

const HtmlLink: React.FC<HtmlLinkProps> = ({ linkInfo, position, onClick }) => {
    const IconComponent = FaIcons[linkInfo.iconName] || FaIcons.FaQuestionCircle;

    const commonClasses = `
        flex items-center gap-2 md:gap-3
        font-mono text-base md:text-lg
        bg-black/50 backdrop-blur-sm
        border border-[var(--foreground)]/30
        text-[var(--text-muted)]
        px-3 py-1.5 md:px-4 md:py-2
        rounded-full
        shadow-lg shadow-[var(--foreground)]/20
        transition-all duration-300 ease-in-out
        cursor-pointer
        whitespace-nowrap
        hover:text-[var(--foreground)]
        hover:border-[var(--foreground)]/80
        hover:bg-black/70
        hover:shadow-[var(--foreground)]/40
        hover:scale-105
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-black/50
    `;

    const content = (
        <>
            <IconComponent className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span>{linkInfo.name}</span>
        </>
    );

    return (
        <Html
            position={position}
            center
            distanceFactor={8} // try reducing distance factor significantly
            className="pointer-events-none select-none" // make wrapper non-interactive
            // transform // <-- remove transform prop to test scaling fix
            // occlude
            // zIndexRange
        >
            {/* make only the button/link interactive */}
            {linkInfo.type === 'button' ? (
                <button
                    onClick={(e) => {
                        // console.log('about me button clicked'); // debug log
                        e.stopPropagation(); // prevent potential issues
                        if (onClick) {
                            onClick(); // call the passed handler
                        }
                    }}
                    className={`${commonClasses} pointer-events-auto`} // enable pointer events here
                >
                    {content}
                </button>
            ) : (
                <a
                    href={linkInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${commonClasses} pointer-events-auto`} // enable pointer events here
                    onClick={(e) => e.stopPropagation()} // stop propagation on links too
                >
                    {content}
                </a>
            )}
        </Html>
    );
};

export default HtmlLink;