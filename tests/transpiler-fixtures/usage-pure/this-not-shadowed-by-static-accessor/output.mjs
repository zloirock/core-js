import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class A extends Array {
  static accessor at = 1;
  foo() {
    return _atMaybeArray(this).call(this, 0);
  }
}