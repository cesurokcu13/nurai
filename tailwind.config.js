/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#EBE4D8',
          card: '#FFFFFF',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E7EEE8',
          200: '#CFDDD1',
          500: '#5A7D64',
          600: '#4A6B53',
          700: '#3D5944',
          800: '#314736',
          900: '#26382A',
        },
        brand: {
          50: '#f4f7f4',
          100: '#e7eee8',
          500: '#4a6b53',
          600: '#3d5944',
          700: '#314736',
          800: '#26382a',
          900: '#1b281e',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['Merriweather', 'Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
