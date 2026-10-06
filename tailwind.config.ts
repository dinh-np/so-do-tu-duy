import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066AB', // Corporate Blue
          hover: '#004B7D',
          light: '#e8f4fd',
          text: '#ffffff',
        },
        canvas: '#ffffff',
        surface: {
          DEFAULT: '#f8f9fa',
          hover: '#f1f5f9',
        },
        border: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'sans-serif'], // UI & Body text with flawless Vietnamese diacritics
        serif: ['"Georgia"', 'serif'], // Mindmap root titles & Presentation covers
      },
    },
  },
  plugins: [],
};

export default config;
