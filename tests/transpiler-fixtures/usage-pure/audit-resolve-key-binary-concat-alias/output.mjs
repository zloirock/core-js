import _isIterable from "@core-js/pure/actual/is-iterable";
// computed-key alias chain where the alias init is itself a string concat -
// `Symbol[k2]` with k2 -> k1 -> 'iter' + 'ator' resolves to `Symbol.iterator`,
// so `Symbol[k2] in obj` rewrites via the is-iterable polyfill
const k1 = 'iter' + 'ator';
const k2 = k1;
_isIterable(obj);