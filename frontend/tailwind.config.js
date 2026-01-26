/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // ← esto es clave
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}