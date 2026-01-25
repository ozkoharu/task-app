/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tarkov: {
          dark: '#1a1a1a',
          darker: '#0f0f0f',
          accent: '#9a8866',
          text: '#c4c4c4',
        },
      },
    },
  },
  plugins: [],
};
