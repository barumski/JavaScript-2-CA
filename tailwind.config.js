/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,mjs}", "!./node_modules/**/*.{html,js,mjs}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Rethink Sans", "system-ui", "sans-serif"],
        display: ["Roboto Flex","system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
}

