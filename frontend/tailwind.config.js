/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Paleta de Tons Pastéis (Design System Eisenmenger Care)
        pastel: {
          teal: {
            50: '#E0F2F1',
            100: '#B2DFDB',
            500: '#00897B',
            600: '#00796B',
            800: '#004D40',
          },
          lavender: {
            50: '#EDE7F6',
            100: '#D1C4E9',
            500: '#7E57C2',
            600: '#673AB7',
            800: '#4527A0',
          },
          rose: {
            50: '#FFEBEE',
            100: '#FFCDD2',
            500: '#E53935',
            600: '#D32F2F',
            800: '#B71C1C',
          },
          amber: {
            50: '#FFF3E0',
            100: '#FFE082',
            500: '#FB8C00',
            600: '#F57C00',
            800: '#E65100',
          },
          mint: {
            50: '#E8F5E9',
            100: '#C8E6C9',
            500: '#43A047',
            600: '#388E3C',
            800: '#1B5E20',
          },
          canvas: '#F8FAFC',
          surface: '#FFFFFF',
          subtle: '#F1F5F9',
        },
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 25px rgba(0, 0, 0, 0.06), 0 4px 10px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-radar': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.9' },
          '70%': { transform: 'scale(3.2)', opacity: '0' },
          '100%': { transform: 'scale(3.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
