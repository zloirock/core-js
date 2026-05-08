import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// alias-chain narrowing must combine with inner-chain detection.
// `const from = Array.from` post-rewrite reads `_Array$from` binding's entry path
// `array/from`, decomposes to (Array, from), narrows arr's type to Array. Outer chain
// `arr?.at?.(0)?.findLast(x => x)` then dispatches: inner `at` and outer `findLast`
// both polyfillable instance methods on Array, must combine into single call. lock both
// the alias-chain narrow AND inner-poly chain emission together
const from = _Array$from;
const arr = from('xy');
const out = null == arr || null == (_ref = _atMaybeArray(arr)) || null == (_ref2 = _ref.call(arr, 0)) ? void 0 : _findLastMaybeArray(_ref2).call(_ref2, x => x);
export { out };