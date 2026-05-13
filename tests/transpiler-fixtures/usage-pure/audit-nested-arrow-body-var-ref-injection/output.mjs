import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// outer arrow expression body contains an inner arrow expression body; both need
// `var _ref;` for `?.` deopt memoization. scope-tracker must wrap each body independently
// and queue both overwrites without one landing inside the other's range. without per-body
// dispatch, an insert at the inner-body position would fall inside the outer overwrite
// and MagicString throws "Cannot split a chunk that has already been edited".
declare const arr: number[][];
declare const brr: number[][];
const f = () => {
  var _ref, _ref2;
  return (null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, 0)) + ((a: number[][]) => {
    var _ref3, _ref4;
    return null == brr || null == (_ref3 = _flatMaybeArray(brr)) ? void 0 : _atMaybeArray(_ref4 = _ref3.call(brr)).call(_ref4, 0);
  })(brr);
};
export { f };