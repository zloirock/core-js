import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
let sideFx = () => 0;
for (const _ref = (sideFx(), [[1, 2], [3]]), at = _atMaybeArray(_ref), flat = _flatMaybeArray(_ref); false;) {
  at(0);
  flat();
}