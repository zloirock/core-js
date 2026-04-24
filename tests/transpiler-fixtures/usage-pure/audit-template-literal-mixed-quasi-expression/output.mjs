import _isIterable from "@core-js/pure/actual/is-iterable";
// mixed quasi + interpolation `${'iter'}ator` must fold to the string 'iterator'
// so `Symbol[...] in obj` is recognised as `Symbol.iterator in obj`
_isIterable(obj);