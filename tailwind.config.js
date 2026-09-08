/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14131A',
          soft: '#1B1A22',
          raised: '#232129',
          border: '#2E2C36',
        },
        paper: {
          DEFAULT: '#F5F3EF',
          dim: '#B7B3AC',
          faint: '#7C7972',
        },
        accent: {
          DEFAULT: '#C9A24B',
          bright: '#E0BE72',
          dim: '#8A7238',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Iowan Old Style"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
