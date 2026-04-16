export default {
  filename: 'input.jsx',
  parserOpts: { plugins: ['jsx'] },
  plugins: [
    [
      '@core-js',
      {
        method: 'usage-pure',
        version: '4.0',
        targets: { ie: 11 },
      },
    ],
  ],
};
