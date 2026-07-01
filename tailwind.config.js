/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          muted: "#6366f133",
          light: "#818cf8",
        },
        accent: {
          DEFAULT: "#a855f7",
          hover: "#9333ea",
        },
        surface: {
          DEFAULT: "#18181b",
          raised: "#27272a",
          border: "#3f3f46",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgb(0 0 0 / 0.12)",
        "soft-lg": "0 12px 40px -8px rgb(0 0 0 / 0.2)",
        glow: "0 0 40px -8px rgb(99 102 241 / 0.45)",
        "glow-sm": "0 0 20px -4px rgb(99 102 241 / 0.35)",
      },
      backgroundImage: {
        "mesh-dark":
          "radial-gradient(ellipse 80% 60% at 50% -20%, rgb(99 102 241 / 0.18), transparent), radial-gradient(ellipse 50% 40% at 100% 0%, rgb(168 85 247 / 0.12), transparent), radial-gradient(ellipse 40% 30% at 0% 100%, rgb(99 102 241 / 0.08), transparent)",
        "mesh-light":
          "radial-gradient(ellipse 80% 60% at 50% -20%, rgb(99 102 241 / 0.08), transparent), radial-gradient(ellipse 50% 40% at 100% 0%, rgb(168 85 247 / 0.06), transparent)",
        "gradient-brand": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
      },
      keyframes: {
        "orbit-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-pulse": {
          "0%, 100%": { opacity: "0.85", transform: "rotate(0deg)" },
          "50%": { opacity: "1", transform: "rotate(180deg)" },
        },
        "output-pulse": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 1px rgb(99 102 241 / 0.35), 0 10px 36px rgb(99 102 241 / 0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px rgb(99 102 241 / 0.5), 0 14px 42px rgb(99 102 241 / 0.32)",
          },
        },
        "card-flip-in": {
          "0%": { opacity: "0", transform: "rotateX(-70deg) translateY(8px)" },
          "100%": { opacity: "1", transform: "rotateX(0deg) translateY(0)" },
        },
        "card-flip-out": {
          "0%": { opacity: "1", transform: "rotateX(0deg) translateY(0)" },
          "100%": { opacity: "0", transform: "rotateX(70deg) translateY(-8px)" },
        },
        "convert-sync": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "dropdown-scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "dropdown-scale-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
      },
      animation: {
        "orbit-slow": "orbit-spin 90s linear infinite",
        "orbit-fast": "orbit-spin 60s linear infinite reverse",
        "spin-pulse": "spin-pulse 3s ease-in-out infinite",
        "output-pulse": "output-pulse 3s ease-in-out infinite",
        "card-flip-in": "card-flip-in 0.45s cubic-bezier(0.34, 1.4, 0.6, 1) forwards",
        "card-flip-out": "card-flip-out 0.3s cubic-bezier(0.34, 1.4, 0.6, 1) forwards",
        float: "float 4s ease-in-out infinite",
        "convert-sync": "convert-sync 2.4s linear infinite",
        "dropdown-scale-in": "dropdown-scale-in 100ms ease-out forwards",
        "dropdown-scale-out": "dropdown-scale-out 100ms ease-in forwards",
      },
    },
  },
  plugins: [],
};
