// `additionalPackages.findIndex(…)` disambiguates the "not found" sentinel from
// a matching `undefined` item. `.find(…)` used to return `undefined` in both cases,
// so the `!== undefined` check silently skipped and `p.toLowerCase()` crashed late
// inside createPolyfillContext. fix: surface clear validation TypeError upfront
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      additionalPackages: ['ok', undefined],
    }],
  ],
};
