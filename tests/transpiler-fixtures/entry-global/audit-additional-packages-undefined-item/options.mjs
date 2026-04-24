// `undefined` item inside `additionalPackages` must raise a clear validation TypeError
// upfront, not a late crash from `p.toLowerCase()` deep in the polyfill context
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      additionalPackages: ['ok', undefined],
    }],
  ],
};
