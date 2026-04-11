import _Array$from from "@core-js/pure/actual/array/from";
class MyArray extends Array {
  static from(x) {
    return _Array$from(x);
  }
}