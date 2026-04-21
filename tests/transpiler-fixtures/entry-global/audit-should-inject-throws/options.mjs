// user callback throwing - provider re-wraps in a new Error with the original on `cause`
// so readonly/frozen Error or primitive throws can't swallow the diagnostic
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
      shouldInjectPolyfill: (name) => {
        if (name === 'es.array.at') throw new Error('boom from user callback');
        return true;
      },
    }],
  ],
};
