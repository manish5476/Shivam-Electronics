
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{html,ts,css}", // Include all Angular files
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

const colors = require('tailwindcss/colors');

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: colors.gray,
        blue: colors.blue,
        yellow: colors.yellow,
        red: colors.red,
        // ... add any colors you’re using
      },
    },
  },
  corePlugins: {
    preflight: true,
  }
};
