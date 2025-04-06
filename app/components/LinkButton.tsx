// src/components/LinkButton.tsx (Updated)
import React from 'react';

interface LinkButtonProps {
    name: string;
    // Change type to accept a rendered element or node
    iconNode: React.ReactNode;
    onClick: () => void;
}

// Update the props destructuring
const LinkButton: React.FC<LinkButtonProps> = ({ name, iconNode, onClick }) => {
    
    return (
        <button
            onClick={onClick}
            className="
        flex items-center gap-3
        text-lg md:text-xl
        font-mono
        text-[var(--foreground)]
        hover:text-white
        transition-colors duration-200
        cursor-pointer
        group
        text-left
      "
            // Explicitly cast here too if needed, otherwise remove 'as string'
            aria-label={name as string}
        >
            {/* Directly render the passed icon node */}
            {iconNode}
            <span>{name}</span>
        </button>
    );
};

export default LinkButton;