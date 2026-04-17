import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class C extends Array {
  [`at${""}`]() {}
  foo() {
    return _atMaybeArray(this).call(this, 0);
  }
}