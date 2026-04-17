import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static first() {
    return (super.at)(0);
  }
  static fromList() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
