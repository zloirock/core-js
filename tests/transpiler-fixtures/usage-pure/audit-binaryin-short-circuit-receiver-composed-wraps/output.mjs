import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS on.
const src = [3, [1, 2]];
// composition: the fold DISCARDS its operands, replaying only calls and structural effects - so an
// operand carrying an `in` of its own must not be erased, or the inner test's throw goes with it.
// the rows walk the wrap meeting other transforms: a nav inside it, a chained dispatch (whose ref
// memo makes a sibling wrap the arrow body), two wraps in one expression, and a wrap in the TEST
// of another one
export function composedWraps(absent) {
  const arr = absent ? null : src;
  return [('flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr, null == _globalThis.window ? void 0 : _Math$trunc(0.5))), true), (() => {
    var _ref;
    return 'at' in (arr == null ? void 0 : _concatMaybeArray(_ref = _sliceMaybeArray(arr).call(arr)).call(_ref, [4])), true;
  })(), [('flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true), ('at' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true)], ('flat' in (('at' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true) ? _sliceMaybeArray(src).call(src) : src), true)];
}