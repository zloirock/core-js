var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface Container<T, U = T[]> {
  items: U;
}
declare const c: Container<number>;
_atMaybeArray(_ref = c.items).call(_ref, -1);