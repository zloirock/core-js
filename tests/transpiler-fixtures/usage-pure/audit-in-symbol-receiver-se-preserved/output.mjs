import _isIterable from "@core-js/pure/actual/is-iterable";
// SE-wrapped receiver around `Symbol.iterator`: `(fn(), Symbol).iterator`. `handleBinaryIn`
// peels the SequenceExpression tail before `asSymbolRef` so the LHS resolves to the same
// symbol-in polyfill (`_isIterable`) as the bare `Symbol.iterator in obj` form. SE preceding-
// elements are then recovered at emit time by `visitSymbolInLhsSe` walking down through
// MemberExpression -> SequenceExpression. covers receiver-SE in parallel to the computed-key
// SE shape (`Symbol[(fn(), 'iterator')] in obj`)
declare const logCall: () => void;
const r = (logCall(), _isIterable({}));