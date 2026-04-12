import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  @bound
  static from(x) {
    return _Array$from.call(this, x);
  }
}