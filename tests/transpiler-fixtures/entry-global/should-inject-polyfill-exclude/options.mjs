export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
      shouldInjectPolyfill: (name) => name !== 'es.object.to-string',
    }],
  ],
};
