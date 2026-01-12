import type { Config } from "tailwindcss";

export default {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#008080', // Teal brand color
                    light: '#00a0a0',
                    dark: '#006060',
                    50: '#f0fdfd',
                    100: '#ccfbfb',
                    900: '#134e4a',
                },
                secondary: {
                    DEFAULT: '#003366', // Navy brand color
                    light: '#004488',
                    dark: '#002244',
                    50: '#f0f4f8',
                    900: '#0f172a',
                },
                disponible: '#008080', // Using brand teal for available
                moyennement: '#f59e0b',
                indisponible: '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.05)',
                'float': '0 10px 30px -10px rgba(0, 51, 102, 0.15)',
            },
        },
    },
    plugins: [],
} satisfies Config;
