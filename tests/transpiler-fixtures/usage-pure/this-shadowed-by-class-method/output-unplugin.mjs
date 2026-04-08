import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class C extends Array {
  at(i) { return 42; }
  foo() { return _atMaybeArray(this).call(this, 0); }
}