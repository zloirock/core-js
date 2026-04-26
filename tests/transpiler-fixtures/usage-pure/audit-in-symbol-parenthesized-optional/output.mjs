import _isIterable from "@core-js/pure/actual/is-iterable";
// `(Symbol?.iterator) in obj` parenthesised optional access: the `in`-check on a
// well-known symbol still routes through the iterability polyfill dispatch.
const obj = {};
_isIterable(obj);