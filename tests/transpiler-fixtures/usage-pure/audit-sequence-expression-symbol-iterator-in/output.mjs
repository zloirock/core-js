import _isIterable from "@core-js/pure/actual/is-iterable";
// `(0, Symbol).iterator in obj` wraps the receiver in a side-effect-free SequenceExpression;
// static detection must see through the paren/sequence and collapse it to `_isIterable(obj)`
_isIterable(obj);