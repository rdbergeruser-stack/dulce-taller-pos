/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dulce: {
          surface: '#fff8f2',
          'surface-dim': '#e1d9cf',
          'surface-card': '#ffffff',
          'surface-container': '#f5ede3',
          'surface-high': '#efe7dd',
          'on-surface': '#1e1b15',
          'on-surface-variant': '#57423a',
          primary: '#9d3c0c',
          'primary-hover': '#7f2b00',
          'primary-container': '#bd5324',
          'primary-light': '#ffdbce',
          secondary: '#7c5641',
          tertiary: '#446147', // Salvia
          'tertiary-light': '#ebffe8',
          espresso: '#1c120c',
          caramel: '#d97736',
          warning: '#d99b26',
          'warning-light': '#fef3c7',
          error: '#ba1a1a',
          'error-light': '#ffdad6',
          border: '#dec0b6',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

