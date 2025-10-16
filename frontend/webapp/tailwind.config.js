const hlmPreset = require('@spartan-ng/ui-core/hlm-tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  presets: [hlmPreset],
  content: [
    './src/**/*.{html,ts}',
    './projects/**/*.{html,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-animate')],
};
