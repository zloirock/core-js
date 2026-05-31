import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Outer arrow expression body contains an inner arrow expression body; both need a
// `var _ref;` declaration for optional-chain receiver memoization. Each declaration must
// be scoped to its own arrow body and the two body-wraps must compose without the inner
// insert landing inside the outer's edit range. If they don't, the bundler aborts on
// overlapping edits and the file fails to emit.
declare const arr: number[][];
declare const brr: number[][];
const f = () => {
  var _ref, _ref2;
  return (null == (_ref = _flatMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, 0)) + ((a: number[][]) => {
    var _ref3, _ref4;
    return null == (_ref3 = _flatMaybeArray(brr)) ? void 0 : _atMaybeArray(_ref4 = _ref3.call(brr)).call(_ref4, 0);
  })(brr);
};
export { f };