/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Coral blush palette (Color Palette 07)
          primary: "#E9967A",    // salmon / coral
          secondary: "#4A3728",  // chocolate - headings & dark text
          accent: "#FFF0ED",     // ivory blush - page background (warmer tint)
          muted: "#8B7355",      // clay - secondary text
          blush: "#F4C2C2",      // blush pink - soft accents
          ivory: "#FFFFF0",      // ivory
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
