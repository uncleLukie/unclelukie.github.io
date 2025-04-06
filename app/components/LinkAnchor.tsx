// src/components/LinkAnchor.tsx
import React from 'react'; // Keep React import

interface LinkAnchorProps {
    name: string;
    url: string;
    // Change type to accept a rendered element or node
    iconNode: React.ReactNode;
}

// Update the props destructuring
const LinkAnchor: React.FC<LinkAnchorProps> = ({ name, url, iconNode }) => {

    // construct the aria-label string first
    const label = `Link to ${name}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-3
              text-lg md:text-xl
              font-mono
              text-[var(--foreground)]
              hover:text-white
              transition-colors duration-200
              group
            "
            // Keep the explicit cast just in case, though it's weird it's needed
            aria-label={label as string}
        >
            {/* Directly render the passed icon node */}
            {iconNode}
            <span>{name}</span>
        </a>
    );
};

export default LinkAnchor;