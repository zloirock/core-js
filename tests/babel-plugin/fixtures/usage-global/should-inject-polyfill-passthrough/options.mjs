export default {
  plugins: [
    ['@core-js', {
      method: 'usage-global',
      version: '4.0',
      targets: { ie: 11 },
      shouldInjectPolyfill: (_name, shouldInject) => shouldInject,
    }],
  ],
};
