export default {
  plugins: [
    ['@core-js', {
      method: 'usage-global',
      version: '4.0',
      targets: { chrome: 135 },
      shouldInjectPolyfill: () => true,
    }],
  ],
};
