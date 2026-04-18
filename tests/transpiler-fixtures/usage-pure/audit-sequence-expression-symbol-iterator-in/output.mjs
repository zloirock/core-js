import _isIterable from "@core-js/pure/actual/is-iterable";
// `(0, Symbol).iterator in obj` wraps the receiver in a side-effect-free SequenceExpression
// (used to break static detection); both plugins should still collapse it to isIterable
_isIterable(obj);