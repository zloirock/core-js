export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { chrome: 100 },
      shouldInjectPolyfill: (mod, base) => base && mod !== 'es.math.sum-precise',
    }],
  ],
};
