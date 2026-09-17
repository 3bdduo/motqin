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
        heading: ["var(--font-tajawal)", "sans-serif"],
        sans: ["var(--font-plex)", "Tahoma", "sans-serif"],
      },
      colors: {
        // Strict Theme Color Tokens
        surface: {
          body: "var(--bg-body)",
          container: "var(--bg-container)",
          card: "var(--bg-card)",
          nested: "var(--bg-nested)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        divider: "var(--border-divider)",
        accent: {
          badge: "var(--badge-accent-bg)",
          "badge-text": "var(--badge-accent-text)",
          primary: "var(--btn-primary-bg)",
          "primary-hover": "var(--btn-primary-hover)",
          "secondary-border": "var(--btn-secondary-border)",
          "secondary-hover": "var(--btn-secondary-hover)",
        },
        // Direct Dark & Light Mode Color Tokens for explicit classes
        theme: {
          dark: {
            bg: "#0A0807",
            container: "#14100D",
            card: "#1D1713",
            nested: "#271F1A",
            text: "#F5F0EB",
            muted: "#A3968B",
            border: "#332922",
            btn: "#C87A4B",
            "btn-hover": "#D98A5B",
            "btn-sec-border": "#4D3E35",
            "badge-bg": "#3A2B22",
            "badge-text": "#E09F6E",
          },
          light: {
            bg: "#F4F8FC",
            container: "#FFFFFF",
            card: "#F8FAFC",
            nested: "#EFF6FF",
            text: "#0F172A",
            muted: "#475569",
            border: "#E2E8F0",
            btn: "#2563EB",
            "btn-hover": "#1D4ED8",
            "btn-sec-border": "#CBD5E1",
            "btn-sec-hover": "#F1F5F9",
            "badge-bg": "#DBEAFE",
            "badge-text": "#1E40AF",
          },
        },
        // Neutral Ink scale aligned with exact tokens
        ink: {
          50: "#F4F8FC",   // Light body/bg
          100: "#EFF6FF",  // Light nested
          200: "#E2E8F0",  // Light border
          300: "#CBD5E1",  // Light secondary border
          400: "#A3968B",  // Dark text-secondary
          500: "#475569",  // Light text-secondary
          600: "#334155",
          700: "#332922",  // Dark border
          800: "#271F1A",  // Dark nested-div
          850: "#1D1713",  // Dark card/inner-div
          900: "#14100D",  // Dark outer container
          950: "#0A0807",  // Dark body/bg
        },
        // Warm Leather / Brown palette for Dark Mode
        leather: {
          300: "#E09F6E",  // Dark badge text
          400: "#D98A5B",  // Dark btn hover
          500: "#C87A4B",  // Dark btn primary
          600: "#4D3E35",  // Dark btn-secondary border
          700: "#3A2B22",  // Dark badge bg
          800: "#271F1A",  // Dark nested
          850: "#1D1713",  // Dark card
          900: "#14100D",  // Dark container
          950: "#0A0807",  // Dark bg
        },
        // Warm beige text scale
        beige: {
          50: "#F5F0EB",   // Dark text primary
          100: "#F5F0EB",
          200: "#EDE6DE",
          300: "#DFD3C6",
          400: "#A3968B",  // Dark text secondary
          500: "#A3968B",
          600: "#8C7B6F",
          700: "#6B5B51",
          800: "#4A3D36",
          900: "#2E241F",
          950: "#1D1713",
        },
        // Blue palette for Light Mode
        blue: {
          50: "#EFF6FF",   // Light nested-div
          100: "#DBEAFE",  // Light badge-bg
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",  // Light btn-primary
          700: "#1D4ED8",  // Light btn-primary hover
          800: "#1E40AF",  // Light badge-text
          900: "#1E3A8A",
          950: "#0F172A",  // Light text-primary
        },
        // Slate for crisp light mode borders & secondary text
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",  // Light border
          300: "#CBD5E1",  // Light secondary border
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",  // Light text-secondary
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",  // Light text-primary
          950: "#020617",
        },
        // Amber for accent highlights
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
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
          950: "#430f0c",
        },
      },
      boxShadow: {
        soft: "0 2px 20px -4px rgba(15, 23, 42, 0.05)",
        "soft-dark": "0 4px 28px -4px rgba(0, 0, 0, 0.8)",
        glow: "0 0 24px -2px rgba(37, 99, 235, 0.4)",
        "glow-leather": "0 0 24px -2px rgba(200, 122, 75, 0.45)",
        card: "0 2px 16px -4px rgba(15, 23, 42, 0.06)",
        "card-dark": "0 4px 24px -6px rgba(0, 0, 0, 0.7)",
        ambient: "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        "ambient-dark": "0 10px 30px -5px rgba(0, 0, 0, 0.65)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
      },
      backgroundImage: {
        "btn-primary-light": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        "btn-primary-dark": "linear-gradient(135deg, #C87A4B 0%, #D98A5B 100%)",
        "leather-gradient": "linear-gradient(135deg, #C87A4B 0%, #D98A5B 100%)",
        "blue-gradient": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.7)" },
          "40%": { transform: "scale(1.25)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px -4px rgba(14,165,198,0.4)" },
          "50%": { boxShadow: "0 0 32px 2px rgba(245,158,11,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "logo-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "logo-spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "logo-breathe": {
          "0%, 100%": { transform: "scale(0.95)", opacity: "0.9" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "check-pop": "check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        wiggle: "wiggle 0.5s ease-in-out",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "logo-spin": "logo-spin 1s linear infinite",
        "logo-spin-slow": "logo-spin 2s linear infinite",
        "logo-spin-reverse": "logo-spin-reverse 1.2s linear infinite",
        "logo-breathe": "logo-breathe 1.5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      transitionDuration: {
        "350": "350ms",
        "400": "400ms",
        "450": "450ms",
        "600": "600ms",
        "700": "700ms",
        "800": "800ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
