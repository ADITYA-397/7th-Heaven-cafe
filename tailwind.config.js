/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8C6A53", // Using Cafe's primary brown
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#D4A373", // Using Cafe's caramel accent
          foreground: "#ffffff",
        },
        background: "#fffbf7",
        border: "hsl(var(--border))",
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};
