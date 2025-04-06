// src/components/AboutModal.tsx
import React from 'react';
import {FaTimes} from 'react-icons/fa'; // Close icon

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({isOpen, onClose}) => {
    // Don't render anything if the modal is closed
    if (!isOpen) {
        return null;
    }

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="
        fixed inset-0 z-40 /* Above other UI, below modal content */
        bg-black/70 /* Black with 70% opacity */
        flex items-center justify-center
        p-4
      "
            onClick={onClose} // Close modal if backdrop is clicked
        >
            {/* Modal Content */}
            <div
                className="
            relative z-50
            bg-[var(--modal-bg)] /* Use variable from globals.css */
            text-[var(--text-light)] /* Use variable */
            p-6 md:p-8
            rounded-lg
            max-w-lg w-full
            border border-[var(--foreground)]/50 /* Border uses new foreground */
            font-sans
            /* --- CHANGE SHADOW COLOR HERE --- */
            shadow-xl shadow-cyan-700/30 /* Example: Cyan shadow, adjust color/opacity */
            /* Or: shadow-teal-700/30 */
          "
                onClick={handleContentClick}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 md:top-4 md:right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                    aria-label="Close About Me modal"
                >
                    <FaTimes className="w-5 h-5 md:w-6 md:h-6"/>
                </button>

                {/* Modal Title using new foreground */}
                <h2 className="text-2xl md:text-3xl font-mono font-bold text-[var(--foreground)] mb-4">
                    About Me
                </h2>

                {/* Modal Body */}
                <div className="space-y-4 text-base md:text-lg leading-relaxed text-[var(--text-light)]">
                    {/* Your content here - uses default text color */}
                    <p>
                        Hey there! Im Luke Hewitt, a passionate developer interested in [Your Interests - e.g., web technologies, 3d graphics, game development].
                    </p>
                    <p>
                        This portfolio showcases some of my work, blending creativity with technical skills. I enjoy building [Types of things you build - e.g., interactive experiences, useful applications] and always learning new things.
                    </p>
                    <p>
                        Feel free to connect via the links provided! {/* Add more about yourself here */}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;