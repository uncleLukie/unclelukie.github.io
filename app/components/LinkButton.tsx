// src/components/LinkButton.tsx
import React from 'react';

interface LinkButtonProps {
    name: string;
    iconNode: React.ReactNode;
    onClick: () => void;
}

const LinkButton: React.FC<LinkButtonProps> = ({ name, iconNode, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="
              flex items-center gap-3 /* keep alignment */
              font-mono text-lg md:text-xl /* keep font/size */
              text-[var(--text-muted)]   /* start with muted color */
              p-2                       /* add some padding */
              rounded-md                /* slightly rounded corners */
              transition-all duration-300 ease-in-out /* smooth */
              group                     /* keep group */
              text-left                 /* ensure text alignment */
              hover:text-[var(--foreground)] /* change text color on hover */
              hover:bg-[var(--foreground)]/10 /* subtle background highlight on hover */
              hover:pl-4                  /* shift text right slightly on hover */
              focus-visible:text-[var(--foreground)] /* ensure focus also highlights */
              focus-visible:bg-[var(--foreground)]/10
              focus-visible:pl-4
            "
            aria-label={name as string}
        >
            {/* render icon */}
            {iconNode}
            {/* text */}
            <span>{name}</span>
        </button>
    );
};

export default LinkButton;