import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
var _ref, _ref2, _ref3;
// singleReturnBodyExpression strict allowlist: ExpressionStatement prefixes are
// preserved by callers via meta.sideEffects; all three IIFEs run multiple ExpressionStatement
// prefix lines before a single return. distinct prototype methods (.at / .findLast / .toSorted)
// surface per-receiver dispatch; the return value drives polyfill resolution for each
const ax = _atMaybeArray(_ref = (() => {
  logA();
  logB();
  return [10, 20, 30];
})()).call(_ref, -1);
const fx = _findLastMaybeArray(_ref2 = (() => {
  logA();
  logB();
  logC();
  return [1, 2, 3];
})()).call(_ref2, v => v > 0);
const tx = _toSortedMaybeArray(_ref3 = (() => {
  logA();
  return [3, 1, 2];
})()).call(_ref3);
export { ax, fx, tx };