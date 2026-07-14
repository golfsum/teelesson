/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./index.ts",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Earthy brand palette: olive greens, warm cream, slate/sage neutrals.
        fairway: {
          50: "#ecfdf5",
          100: "#d2f9e4",
          200: "#9bf0c4",
          300: "#5ce39f",
          400: "#22d17b",
          500: "#0aae63",
          600: "#057545",
          700: "#086e42",
          800: "#075737",
          900: "#05452e",
        },
        sand: {
          50: "#fffaf0",
          100: "#fff1d6",
          200: "#ffe4ad",
        },
        ink: {
          50: "#f5f8f7",
          100: "#edf2f0",
          200: "#d9e3df",
          300: "#bdcbc6",
          400: "#5f716b",
          500: "#5b6d67",
          600: "#455852",
          700: "#30443e",
          800: "#1b302a",
          900: "#0b1f1a",
        },
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
