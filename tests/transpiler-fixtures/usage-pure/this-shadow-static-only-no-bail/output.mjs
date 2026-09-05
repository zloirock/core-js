import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class C extends Array {
  static at() {
    return 'static-at';
  }
  foo() {
    return _atMaybeArray(this).call(this, 0);
  }
}