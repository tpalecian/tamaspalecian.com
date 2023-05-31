const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
      }
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
