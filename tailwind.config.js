/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cosmicBlue: "#1e3a8a",
        cosmicIndigo: "#312e81",
        cosmicGlow: "#60a5fa"
      }
    }
  },
  plugins: []
};
