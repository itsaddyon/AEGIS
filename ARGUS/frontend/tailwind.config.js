/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F5F0",
        surface: "#FFFFFF",
        "surface-muted": "#EFEDE6",
        graphite: "#040508",
        charcoal: "#0a0c10",
        cream: "#F7F5F0",
        slate: {
          DEFAULT: "#5B6472",
          light: "#8B93A1",
          dark: "#3A4048",
        },
        olive: "#7A8450",
        teal: "#3F7D77",
        warning: "#C1662F",
        danger: "#9B2C2C",
        border: {
          DEFAULT: "#E3E0D8",
          dark: "rgba(0, 240, 255, 0.15)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.04)",
        panel: "0 1px 3px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
