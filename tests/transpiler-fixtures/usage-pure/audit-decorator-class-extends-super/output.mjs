import _Array$from from "@core-js/pure/actual/array/from";
@decorator
class A extends Array {
  static f(x) {
    return _Array$from.call(this, x);
  }
}