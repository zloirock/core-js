import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
class A extends Array {
  static f() {
    const arr = _Array$from.call(this, [1, 2, 3]);
    return _at(arr).call(arr, -1);
  }
}