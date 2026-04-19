// primitive throw (`throw 'plain string'`) inside shouldInjectPolyfill must not be
// swallowed by a TypeError on `error.message = ...` reassignment; the wrapper Error
// should carry the stringified value and preserve the original via `cause`
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-pure',
      version: '4.0',
      targets: { ie: 11 },
      shouldInjectPolyfill: () => { throw 'plain string'; },
    }],
  ],
};
