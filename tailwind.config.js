// tailwind.config.js

import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
                mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                'primary': 'var(--foreground)',
                'modal-bg': 'var(--modal-bg)',
                'text-light': 'var(--text-light)',
                'text-muted': 'var(--text-muted)',
            }
        },
    },
    plugins: [
    ],
};