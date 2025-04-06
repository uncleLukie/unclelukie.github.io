// tailwind.config.js

// Correctly import the default theme object using require
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
module.exports = {
    // Update content paths to include src/components if you use it
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Add this if your components are in src
        // Add other paths if needed
    ],
    theme: {
        extend: {
            // Integrate next/font variables
            fontFamily: {
                // Access the fontFamily property *from* the defaultTheme object
                sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans], // Use variable + fallbacks
                mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],   // Use variable + fallbacks
            },
            // Define colors using your CSS variables (optional but good practice)
            colors: {
                // You can map your CSS variables to Tailwind color names
                'primary': 'var(--foreground)', // Use the main color variable
                'modal-bg': 'var(--modal-bg)',
                'text-light': 'var(--text-light)',
                'text-muted': 'var(--text-muted)',
            }
        },
    },
    plugins: [
        // Add any plugins here
    ],
};