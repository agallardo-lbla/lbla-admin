/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lbla: {
          blue: '#1b357f',
          dark: '#10204d',
          green: '#07763b',
          gold: '#f8e475',
          amber: '#d4a017',
          light: '#f5f7fa',
          gray: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
