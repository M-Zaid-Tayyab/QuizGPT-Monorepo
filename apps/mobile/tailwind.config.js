/** @type {import('tailwindcss').Config} */
const colors = require("./app/constants/colors");
const fonts = require("./app/constants/fonts");
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: colors,
      fontFamily: fonts,
    },
  },
  plugins: [],
};
