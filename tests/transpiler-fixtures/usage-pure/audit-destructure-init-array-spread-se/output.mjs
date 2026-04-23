import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `[...xs, ...ys]` as destructure init - ArrayExpression with SpreadElement is now treated
// as SE (unified с ObjectExpression). array spread calls `Symbol.iterator` on the iterable,
// which is arbitrary user code. wrapBodylessWithSideEffect / deferSideEffect now detect
// this correctly. before: array spread was silently transparent
if (cond) var at = _atMaybeArray([...xs, ...ys]);
at(0);