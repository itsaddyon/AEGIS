/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // VISTA Neutral colors
        canvas: '#F7F5F0',
        surface: '#FFFFFF',
        'surface-muted': '#EFEDE6',
        // Dark theme surfaces
        graphite: '#1E1F22',
        charcoal: '#26282C',
        slate: {
          DEFAULT: '#5B6472',
          light: '#8B93A1',
          dark: '#3A4048',
        },
        // Accents from VISTA
        teal: {
          DEFAULT: '#3F7D77',
          muted: '#3E706A',
          soft: '#DCE9E6',
        },
        olive: '#7A8450',
        forest: '#2F4A3C',
        cream: '#F4F1E9',
        warning: '#C1662F',
        danger: '#9B2C2C',
        border: {
          DEFAULT: '#E3E0D8',
          dark: '#33353A',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Fraunces"', '"Georgia"', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(20,20,18,0.04)',
        card: '0 1px 3px rgba(20,20,18,0.06), 0 8px 24px rgba(20,20,18,0.06)',
      },
    },
  },
  plugins: [],
}
