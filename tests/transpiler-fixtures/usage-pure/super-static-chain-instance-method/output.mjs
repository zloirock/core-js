import _at from "@core-js/pure/actual/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static f() {
    var _ref;
    return _at(_ref = _Array$from.call(this, [1])).call(_ref, -1);
  }
}