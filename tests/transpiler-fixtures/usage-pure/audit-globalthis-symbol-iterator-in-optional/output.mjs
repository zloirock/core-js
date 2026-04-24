import _isIterable from "@core-js/pure/actual/is-iterable";
// optional-chained proxy-global access to a well-known symbol:
// `globalThis?.Symbol?.iterator in x` should behave like the non-optional form and
// rewrite through the is-iterable polyfill
_isIterable(x);