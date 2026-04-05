export default {
  filename: 'input.jsx',
  parserOpts: { plugins: ['jsx'] },
  plugins: [
    [
      '@core-js',
      {
        method: 'entry-global',
        version: '4.0',
      },
    ],
  ],
};
