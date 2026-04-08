import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static toArrays(items) {
    return _mapMaybeArray(items).call(items, x => _Array$from([x]));
  }
}