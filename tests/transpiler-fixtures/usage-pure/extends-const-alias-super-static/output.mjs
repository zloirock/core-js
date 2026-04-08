import _Array$from from "@core-js/pure/actual/array/from";
const Base = Array;
class A extends Base {
  static foo() {
    return _Array$from([1, 2, 3]);
  }
}