import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a1a2e",
          50: "#f0f0f8",
          100: "#d8d8ef",
          500: "#4a4a8a",
          600: "#3a3a7a",
          900: "#1a1a2e",
        },
        accent: {
          DEFAULT: "#c8a96e",
          light: "#e8c98e",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
