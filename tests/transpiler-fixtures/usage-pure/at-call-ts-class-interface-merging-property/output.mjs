var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface Box {
  items: number[];
}
class Box {}
const b = new Box();
_atMaybeArray(_ref = b.items).call(_ref, 0);