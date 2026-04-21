// empty arrays on include/exclude must NOT conflict with shouldInjectPolyfill (common in
// conditional config: `include: condition ? ['x'] : []`). only non-empty lists trip the
// "mis-configuration" rejection
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
      include: [],
      exclude: [],
      shouldInjectPolyfill: () => false,
    }],
  ],
};
