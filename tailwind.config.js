/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        lbla: {
          blue: '#1b357f',
          dark: '#10204d',
          green: '#07763b',
          gold: '#f8e475',
          yellow: '#f8ee7a',
          amber: '#d4a017',
          light: '#f5f7fa',
          gray: '#e2e8f0',
        },
        admin: {
          primary: '#334e9b',
          sidebar: '#15224a',
          title: '#eff1f7',
        }
      }
    },
  },
  plugins: [],
}
