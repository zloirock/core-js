import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _Map from "@core-js/pure/actual/map/constructor";
class C {
  static {
    let T;
    T = _Map;
    T = [6];
    _atMaybeArray(T).call(T, 0);
    C.r9 = (_findLastIndexMaybeArray(T) || 0).call(T, Boolean);
  }
}
export { C };