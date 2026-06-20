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
          50: "#f4f6ee",
          100: "#e7ecd7",
          200: "#cfd9b4",
          300: "#b2c189",
          400: "#8ea862",
          500: "#6C844C", // primary brand olive
          600: "#5b7040",
          700: "#5F5933", // deep olive (headers, splash)
          800: "#474328",
          900: "#33311d",
        },
        sand: {
          50: "#fefcf6",
          100: "#fdf3dd",
          200: "#F9E6BF", // warm cream
        },
        ink: {
          50: "#f5f7f6",
          100: "#e9edec",
          200: "#d4dbd9",
          400: "#9CACA7", // muted sage
          500: "#687a76",
          700: "#3C505C", // slate text
          900: "#26333b",
        },
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
