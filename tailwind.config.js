/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mora: {
          bg: '#0A0A0A',
          surface: '#111111',
          border: '#1C1C1C',
          text: '#F0EEE8',
          muted: '#6B6B6B',
          accent: '#C8F070',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
