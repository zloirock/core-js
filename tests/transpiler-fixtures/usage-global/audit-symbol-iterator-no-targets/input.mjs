// usage-global mode without explicit `targets` - resolver assumes broadest possible
// target set (all polyfills needed). `Symbol.iterator in obj` registers full iterator
// suite identically to ie11 targeting (both targets reach the polyfill threshold for
// these modules). covers no-targets default behavior
Symbol.iterator in obj;
