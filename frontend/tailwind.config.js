/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#334155', 
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'typing-dot': 'typing 1.5s infinite ease-in-out',
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}