// `globalThis.Symbol.iterator in x` - proxy-global access to a well-known symbol
// should rewrite the `in`-check through the is-iterable polyfill
globalThis.Symbol.iterator in x;
