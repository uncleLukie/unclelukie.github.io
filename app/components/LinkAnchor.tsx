// src/components/LinkAnchor.tsx
import React from 'react';

interface LinkAnchorProps {
    name: string;
    url: string;
    iconNode: React.ReactNode;
}

const LinkAnchor: React.FC<LinkAnchorProps> = ({ name, url, iconNode }) => {
    const label = `Link to ${name}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-3  /* keep alignment */
              font-mono text-lg md:text-xl /* keep font/size */
              text-[var(--text-muted)]   /* start with muted color */
              p-2                       /* add some padding */
              rounded-md                /* slightly rounded corners */
              transition-all duration-300 ease-in-out /* smooth transition */
              group                     /* keep group for potential parent hover */
              hover:text-[var(--foreground)] /* change text color on hover */
              hover:bg-[var(--foreground)]/10 /* subtle background highlight on hover */
              hover:pl-4                  /* shift text right slightly on hover */
              focus-visible:text-[var(--foreground)] /* ensure focus also highlights */
              focus-visible:bg-[var(--foreground)]/10
              focus-visible:pl-4
            "
            aria-label={label as string}
        >
            {/* render icon */}
            {iconNode}
            {/* text */}
            <span>{name}</span>
        </a>
    );
};

export default LinkAnchor;