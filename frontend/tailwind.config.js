/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3E49',
        secondary: '#6EAEA2',
        accent: '#AD5637',
        dark: '#1A343D',
        light: '#CBCFBB',
      },
    },
  },
  plugins: [],
}
