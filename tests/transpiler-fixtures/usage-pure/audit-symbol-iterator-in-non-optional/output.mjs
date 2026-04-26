import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol.iterator in obj` non-optional form: the iterability `in`-check is rewritten
// through the polyfill dispatch.
_isIterable(obj);
_isIterable(obj);