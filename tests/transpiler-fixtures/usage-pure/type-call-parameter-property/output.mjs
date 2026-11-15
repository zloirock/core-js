import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A constructor parameter property binds the argument before the generic default.
class Box<T = string> {
  constructor(public value: T) {}
  get(): T {
    return this.value;
  }
}
_atMaybeArray(_ref = new Box([1, 2]).get()).call(_ref, -1);