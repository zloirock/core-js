import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
interface Box<T> {
  val: T;
}
function isBox(o: unknown): o is Box<number[]> {
  return true;
}
// the ternary nullable fold composes with a predicate-narrowed receiver
function gt(v: unknown, c: boolean) {
  if (isBox(v)) {
    var _ref, _ref2;
    null == (_ref = c ? v.val : null) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);
    _entriesMaybeArray(_ref2 = c ? v.val : null).call(_ref2);
  }
}