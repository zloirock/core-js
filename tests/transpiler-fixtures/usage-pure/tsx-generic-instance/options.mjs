export default {
  filename: 'input.tsx',
  parserOpts: { plugins: ['jsx', 'typescript'] },
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
