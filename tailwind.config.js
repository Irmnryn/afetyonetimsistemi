/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Bu satır senin App.jsx içindeki mor renkleri görmesini sağlar!
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#dce9ff',
          500: '#1f4ec9',
          600: '#183ea6',
          700: '#122f7d',
        },
      },
      boxShadow: {
        panel: '0 24px 60px -28px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}
