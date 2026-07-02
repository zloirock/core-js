import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
var _ref, _ref2;
// Value-binding `T` and interface type-param `T` share a name; `typeof T` must address the value space.
// Substitution must skip value-space refs in `typeof` queries so `b.val` keeps its runtime array shape.
const T = [1, 2, 3];
interface Box<T> {
  val: typeof T;
}
declare const b: Box<string>;
const head = _atMaybeArray(_ref = b.val).call(_ref, 0);
const idx = _findLastIndexMaybeArray(_ref2 = b.val).call(_ref2, x => x > 0);
export { head, idx };