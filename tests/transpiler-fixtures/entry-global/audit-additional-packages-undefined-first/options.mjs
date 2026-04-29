// `undefined` as the first item of `additionalPackages` must raise a validation TypeError,
// not be confused with a "not found" sentinel during lookup
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      additionalPackages: [undefined, 'ok'],
    }],
  ],
};
