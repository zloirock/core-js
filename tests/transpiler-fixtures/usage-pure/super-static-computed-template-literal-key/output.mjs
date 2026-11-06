import _Array$from from "@core-js/pure/actual/array/from";
class C extends Array {
  static foo() {
    return _Array$from.call(this, [1]);
  }
}