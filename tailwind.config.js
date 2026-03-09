/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './projects/store/src/**/*.{html,ts,scss,css}',
    './projects/admin/src/**/*.{html,ts,scss,css}',
    './projects/vendor/src/**/*.{html,ts,scss,css}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
