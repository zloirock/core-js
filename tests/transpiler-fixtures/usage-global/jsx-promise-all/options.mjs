export default {
  filename: 'input.jsx',
  parserOpts: { plugins: ['jsx'] },
  plugins: [
    [
      '@core-js',
      {
        method: 'usage-global',
        version: '4.0',
        targets: { ie: 11 },
      },
    ],
  ],
};
