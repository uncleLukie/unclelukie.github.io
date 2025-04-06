// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
    return (
        <h1
            className="
        absolute top-8 left-8 md:top-12 md:left-12 /* Adjust positioning */
        text-3xl md:text-4xl lg:text-5xl /* Responsive text size */
        font-mono font-bold /* Use Geist Mono */
        text-[var(--foreground)] /* Bright purple color */
        z-20 /* Ensure it's above the canvas but potentially below modals */
        pointer-events-none /* Allow clicks to pass through if needed */
        /* Optional: subtle text shadow for depth */
        // style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}
      "
        >
            uncleLukie
        </h1>
    );
};

export default Header;