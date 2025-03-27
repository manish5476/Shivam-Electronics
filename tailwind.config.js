module.exports = {
  theme: {
    extend: {},
    color: { mode: 'rgb' } // Force Tailwind to use RGB instead of OKLCH
  },
  corePlugins: {
    preflight: false, // Optional: If you face CSS reset issues
  },
  plugins: [],
};
