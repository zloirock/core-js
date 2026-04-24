// user callback receives `(mod, base)` - `base` is the default decision from targets/include/
// exclude. callback can drop es.object.to-string even though ie 11 needs it
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
      shouldInjectPolyfill: (mod, base) => base && mod !== 'es.object.to-string',
    }],
  ],
};
