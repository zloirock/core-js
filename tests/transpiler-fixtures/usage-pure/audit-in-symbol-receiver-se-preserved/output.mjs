import _isIterable from "@core-js/pure/actual/is-iterable";
// SE-wrapped receiver around `Symbol.iterator`: `(fn(), Symbol).iterator`. detection must peel
// the SequenceExpression tail before resolving the symbol, so the LHS resolves to the same
// symbol-in polyfill (`_isIterable`) as the bare `Symbol.iterator in obj` form. the leading SE
// elements are recovered at emit by the side-effect harvest; parallel to the computed-key shape.
declare const logCall: () => void;
const r = (logCall(), _isIterable({}));