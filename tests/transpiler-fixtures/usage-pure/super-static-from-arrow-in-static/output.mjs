import _Array$from from "@core-js/pure/actual/array/from";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
class A extends Array {
  static toArrays(items) {
    return _mapMaybeArray(items).call(items, x => _Array$from.call(this, [x]));
  }
}