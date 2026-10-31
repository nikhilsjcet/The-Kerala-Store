/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: '#0A5C36',
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D',
            800: '#0A5C36',
            900: '#064024',
            950: '#032313',
          },
          mint: {
            DEFAULT: '#E8F5ED',
            dark: '#D4EAD9',
          },
          charcoal: {
            DEFAULT: '#191C1E',
            light: '#2D3135',
            muted: '#64748B',
          },
          gold: {
            DEFAULT: '#D4AF37',
            light: '#F5E6B3',
            dark: '#AA820A',
          },
          pink: '#FF3B80',
          red: '#DC2626',
          purple: '#7C3AED',
          blue: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(10, 92, 54, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

