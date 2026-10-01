import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol?.iterator in obj` - optional-chain form must be recognised as
// `Symbol.iterator in obj`, so the is-iterable polyfill is injected
_isIterable(obj);