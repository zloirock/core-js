import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// for-loop init destructuring multiple instance-method properties from a side-effecting
// receiver: the receiver must be evaluated once and shared.
let sideFx = () => 0;
for (const _ref = (sideFx(), [[1, 2], [3]]), at = _atMaybeArray(_ref), flat = _flatMaybeArray(_ref); false;) {
  at(0);
  flat();
}