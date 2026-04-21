// primitive throw - wrapper uses `String(error)` fallback so the diagnostic still surfaces
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
      shouldInjectPolyfill: (name) => {
        if (name === 'es.array.at') throw 'raw string thrown';
        return true;
      },
    }],
  ],
};
