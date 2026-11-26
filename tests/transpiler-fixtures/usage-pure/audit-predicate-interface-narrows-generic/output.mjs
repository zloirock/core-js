import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
// a generic target substitutes its type arguments
interface Box<T> {
  val: T;
}
function isBox(o: unknown): o is Box<number[]> {
  return true;
}
function gx(v: unknown) {
  if (isBox(v)) {
    var _ref, _ref2;
    _atMaybeArray(_ref = v.val).call(_ref, 0);
    _copyWithinMaybeArray(_ref2 = v.val).call(_ref2, 0, 1);
  }
}