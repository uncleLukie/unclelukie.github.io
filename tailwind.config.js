/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'retro-purple': '#cc33ff',
                'retro-black': '#000000',
                'retro-green': '#00ff00',
            },
            fontFamily: {
                mono: ['"Courier New"', 'monospace'],
            },
        },
    },
    plugins: [],
};
