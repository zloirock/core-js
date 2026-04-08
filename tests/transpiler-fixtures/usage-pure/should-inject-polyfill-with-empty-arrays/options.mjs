export default {
  plugins: [
    ['@core-js', {
      method: 'usage-pure',
      version: '4.0',
      targets: { ie: 11 },
      include: [],
      exclude: [],
      shouldInjectPolyfill: (name, defaultInject) => defaultInject,
    }],
  ],
};
