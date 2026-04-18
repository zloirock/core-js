import _isIterable from "@core-js/pure/actual/is-iterable";
// TSAsExpression wraps `Symbol`; isInReceiverOfInExpression must peel it before
// matching the BinaryExpression(`in`) - otherwise a stray `_Symbol` import leaks
_isIterable(obj);