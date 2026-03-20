/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a0f',
          surface: '#0f0f1a',
          cyan: '#00fff5',
          pink: '#ff006e',
          yellow: '#ffd60a',
          muted: '#2a2a4a',
          text: '#c8c8e8',
        },
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}