/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0A',
          surface: '#1A1A1A',
          elevated: '#222222',
          input: '#1E1E1E',
        },
        accent: {
          lime: '#C5F135',
          'lime-dark': '#A8D420',
        },
        txt: {
          primary: '#FFFFFF',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        border: {
          subtle: '#2A2A2A',
          default: '#333333',
        },
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
        input: '12px',
        badge: '8px',
      },
      fontFamily: {
        bold: ['System'],
        regular: ['System'],
      },
    },
  },
  plugins: [],
};
