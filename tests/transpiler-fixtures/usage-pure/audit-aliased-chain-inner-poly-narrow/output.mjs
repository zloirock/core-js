import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref;
// alias-chain narrowing must combine with inner-chain detection. `const from = Array.from`
// narrows `arr` to Array, so the outer optional chain `arr?.at?.(0)?.findLast(x => x)`
// sees both `at` and `findLast` as polyfillable Array instance methods and emits them in a
// single combined call. lock the alias-chain narrow AND the inner-poly chain together
const from = _Array$from;
const arr = from('xy');
const out = null == arr || null == (_ref = _atMaybeArray(arr)?.call(arr, 0)) ? void 0 : _findLastMaybeArray(_ref).call(_ref, x => x);
export { out };