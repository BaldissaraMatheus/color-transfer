module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      black: '#1a1b26',
      white: '#eaeaed',
      gray: '#e2e2e6',
      blue: '#a9b1d6',
      red: '#f7768e',
      orange: '#ff9e64',
      purple: '#5a4a78'
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
