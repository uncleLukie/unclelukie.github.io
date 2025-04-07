// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
    return (
        <h1
            className="
              text-3xl md:text-4xl lg:text-5xl
              font-mono font-bold
              text-[var(--foreground)]
              pointer-events-none
              mb-4 /* add some bottom margin */
            "
        >
            uncleLukie
        </h1>
    );
};

export default Header;