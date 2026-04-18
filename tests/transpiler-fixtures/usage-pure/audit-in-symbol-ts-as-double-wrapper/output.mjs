import _isIterable from "@core-js/pure/actual/is-iterable";
// unwrapParens `while`-loop must peel nested TS wrappers too, not just one level
_isIterable(obj);