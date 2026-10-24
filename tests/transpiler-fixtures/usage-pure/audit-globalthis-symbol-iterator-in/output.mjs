import _isIterable from "@core-js/pure/actual/is-iterable";
// `globalThis.Symbol.iterator in x` - proxy-global access to a well-known symbol
// should rewrite the `in`-check through the is-iterable polyfill
_isIterable(x);