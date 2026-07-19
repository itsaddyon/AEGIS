/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light theme surfaces
        canvas: "#F7F5F0",       // warm off-white
        surface: "#FFFFFF",
        "surface-muted": "#EFEDE6",
        // Dark theme surfaces
        graphite: "#1E1F22",
        charcoal: "#26282C",
        // Shared neutrals
        slate: {
          DEFAULT: "#5B6472",
          light: "#8B93A1",
          dark: "#3A4048",
        },
        // Accents
        olive: "#7A8450",
        teal: "#3F7D77",
        warning: "#C1662F",   // burnt orange
        danger: "#9B2C2C",    // deep crimson
        border: {
          DEFAULT: "#E3E0D8",
          dark: "#33353A",
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
