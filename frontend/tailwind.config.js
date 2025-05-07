/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'srh-blue': '#003087',
        'srh-blue-light': '#004db3',
        'srh-orange': '#FF5F00',
      },
    },
  },
  plugins: [],
}