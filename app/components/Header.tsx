// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
    return (
        <h1
            className="
              /* REMOVED: absolute top-8 left-8 md:top-12 md:left-12 */
              text-3xl md:text-4xl lg:text-5xl /* Keep responsive text size */
              font-mono font-bold /* Keep font */
              text-[var(--foreground)] /* Keep color */
              /* z-20 is less critical now, parent handles layering */
              pointer-events-none /* Keep if needed */
            "
            // Removed optional style
        >
            uncleLukie
        </h1>
    );
};

export default Header;