const config = {
  plugins: [
    "@tailwindcss/postcss",
    "autoprefixer",
    "cssnano", // Minifies CSS
    ["postcss-preset-env", {
      // Enable future CSS features and polyfill for older browsers
      stage: 1,
      features: {
        'nesting-rules': true,
        'custom-properties': false, // Already handled by Tailwind
      },
      // Optimize for mobile first
      browsers: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not IE 11'
      ]
    }]
  ],
};

export default config;
