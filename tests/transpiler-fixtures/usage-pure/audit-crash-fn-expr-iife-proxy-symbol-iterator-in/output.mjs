import _isIterable from "@core-js/pure/actual/is-iterable";
// usage-pure `Symbol.iterator in obj` where the proxy-global root is reached through a
// FunctionExpression IIFE (not an arrow): the inner proxy global must still be subsumed by the
// is-iterable rewrite, or the identifier visitor stages an overlapping rewrite. regression lock
const r = _isIterable(obj);
r;