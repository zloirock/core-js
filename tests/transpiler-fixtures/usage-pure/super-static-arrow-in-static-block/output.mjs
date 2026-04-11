import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static {
    var _ref;
    _mapMaybeArray(_ref = []).call(_ref, x => _Array$from.call(this, [x]));
  }
}