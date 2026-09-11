import _isIterable from "@core-js/pure/actual/is-iterable";
// template literal with all-literal interpolations resolves to a constant string, so
// `Symbol[\`${'iter'}${'ator'}\`]` can be recognised as `Symbol.iterator` and collapsed
_isIterable(obj);