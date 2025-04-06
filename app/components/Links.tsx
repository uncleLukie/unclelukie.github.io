// src/components/Links.tsx
import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaFileAlt, FaDiscord } from 'react-icons/fa';
import LinkAnchor from './LinkAnchor';
import LinkButton from './LinkButton';

// Define link structure
interface LinkItemData {
    name: string;
    url?: string;
    icon: React.ElementType; // Base type from react-icons
    isButton?: boolean;
}

interface LinksProps {
    onAboutClick: () => void;
}

// Define a more specific type for SVG components that accept className etc.
type SvgComponentType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const Links: React.FC<LinksProps> = ({ onAboutClick }) => {
    // Link data
    const linkItemsData: LinkItemData[] = [
        { name: 'GitHub', url: 'https://github.com/uncleLukie', icon: FaGithub },
        { name: 'LinkedIn', url: 'https://linkedin.com/in/unclelukie', icon: FaLinkedin },
        { name: 'Resume', url: '/path/to/your/resume.pdf', icon: FaFileAlt },
        { name: 'Email', url: 'mailto:lsjhewitt@gmail.com', icon: FaEnvelope },
        { name: 'Discord', url: 'https://discordapp.com/users/99079218897371136', icon: FaDiscord },
        { name: 'About Me', icon: FaFileAlt, isButton: true },
    ];

    return (
        <nav
            className="
              absolute top-28 left-8 md:top-32 md:left-12
              z-20
              flex flex-col gap-3 md:gap-4
            "
        >
            {linkItemsData.map((item) => {
                // *** Explicitly cast item.icon to our specific SVG component type ***
                const IconComponent = item.icon as SvgComponentType;

                // Now, rendering this should allow standard SVG props like className
                const renderedIcon = <IconComponent className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />; // Line 40

                let linkElement: React.ReactNode = null;

                if (item.isButton) {
                    linkElement = (
                        <LinkButton
                            key={item.name}
                            name={item.name}
                            iconNode={renderedIcon}
                            onClick={onAboutClick}
                        />
                    );
                } else if (item.url) {
                    linkElement = (
                        <LinkAnchor
                            key={item.name}
                            name={item.name}
                            url={item.url}
                            iconNode={renderedIcon}
                        />
                    );
                }

                return linkElement;
            })}
        </nav>
    );
};

export default Links;