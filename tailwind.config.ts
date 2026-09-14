import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-tajawal)", "Tahoma", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f4f7f6",
          100: "#e4ebe9",
          200: "#c3d3d0",
          300: "#95afab",
          400: "#5f8480",
          500: "#3d6662",
          600: "#2c504d",
          700: "#264240",
          800: "#1c3230",
          900: "#0e1b1a",
          950: "#080f0e",
        },
        brand: {
          50: "#eefbf7",
          100: "#d6f5ec",
          200: "#aeeada",
          300: "#79d9c1",
          400: "#43c0a3",
          500: "#22a488",
          600: "#16826d",
          700: "#146859",
          800: "#145349",
          900: "#12443d",
          950: "#062723",
        },
        amber: {
          50: "#fffaeb",
          100: "#fdefc7",
          200: "#fbdd89",
          300: "#f9c74f",
          400: "#f6ac2e",
          500: "#ef8e15",
          600: "#d36c0e",
          700: "#af4e10",
          800: "#8e3d14",
          900: "#753314",
        },
        coral: {
          50: "#fef3f2",
          100: "#fee4e2",
          200: "#fecdc9",
          300: "#fca9a3",
          400: "#f8796f",
          500: "#ef5142",
          600: "#dc3524",
          700: "#b9291b",
          800: "#99251b",
          900: "#7f251c",
        },
      },
      boxShadow: {
        soft: "0 2px 20px -4px rgba(14, 27, 26, 0.08)",
        "soft-dark": "0 2px 24px -4px rgba(0, 0, 0, 0.4)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "check-pop": "check-pop 0.28s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
