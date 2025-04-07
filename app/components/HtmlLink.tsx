// src/components/HtmlLink.tsx
import React from 'react';
import { Html } from '@react-three/drei';
import * as FaIcons from 'react-icons/fa'; // import all Fa icons

// Define structure for link data passed down
export interface LinkInfo {
    name: string;
    url?: string;
    type: 'link' | 'button';
    iconName: keyof typeof FaIcons; // use icon name string
}

interface HtmlLinkProps {
    linkInfo: LinkInfo;
    position: [number, number, number]; // position relative to parent in 3d scene
    onClick?: () => void; // for buttons
}

const HtmlLink: React.FC<HtmlLinkProps> = ({ linkInfo, position, onClick }) => {
    // get the actual icon component based on the name string
    const IconComponent = FaIcons[linkInfo.iconName] || FaIcons.FaQuestionCircle; // fallback icon

    const commonClasses = `
        flex items-center gap-2 md:gap-3 /* alignment and spacing */
        font-mono text-base md:text-lg /* font and size */
        bg-black/50 backdrop-blur-sm /* semi-transparent background */
        border border-[var(--foreground)]/30 /* subtle border */
        text-[var(--text-muted)] /* default text color */
        px-3 py-1.5 md:px-4 md:py-2 /* padding */
        rounded-full /* fully rounded */
        shadow-lg shadow-[var(--foreground)]/20 /* subtle glow */
        transition-all duration-300 ease-in-out
        cursor-pointer
        whitespace-nowrap /* prevent text wrapping */
        hover:text-[var(--foreground)]
        hover:border-[var(--foreground)]/80
        hover:bg-black/70
        hover:shadow-[var(--foreground)]/40
        hover:scale-105 /* slight zoom on hover */
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-black/50
    `;

    const content = (
        <>
            <IconComponent className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span>{linkInfo.name}</span>
        </>
    );

    return (
        // use Drei's Html component to project onto the scene
        <Html
            position={position} // position offset from the parent node/group
            center // centers the html content relative to the attachment point
            distanceFactor={10} // makes html scale down realistically with distance
            className="pointer-events-none" // prevent html from blocking 3d interactions *underneath* it
            // wrapperClassName // optional: add classes to the outer div created by <Html> if needed
            // zIndexRange={[10, 0]} // control render order relative to 3d objects
            transform // makes positioning/rotation follow the 3d object more accurately
            // occlude // hides html if behind other 3d objects (can be 'raycast' or mesh ref)
        >
            {/* apply pointer-events-auto *only* to the interactive element */}
            {linkInfo.type === 'button' ? (
                <button onClick={onClick} className={`${commonClasses} pointer-events-auto`}>
                    {content}
                </button>
            ) : (
                <a href={linkInfo.url} target="_blank" rel="noopener noreferrer" className={`${commonClasses} pointer-events-auto`}>
                    {content}
                </a>
            )}
        </Html>
    );
};

export default HtmlLink;