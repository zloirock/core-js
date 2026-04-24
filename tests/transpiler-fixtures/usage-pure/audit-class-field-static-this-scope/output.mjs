import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// static methods bind `this` to the class itself, not to an instance. `this.#box = 'abc'`
// inside `static wipe()` must NOT contribute `"abc"` to the instance field's inferred
// type; `#box` stays Array, and `.at(0)` picks the array-specific polyfill
class C {
  #box = [];
  static wipe() {
    this.#box = "abc";
  }
  first() {
    var _ref;
    return _atMaybeArray(_ref = this.#box).call(_ref, 0);
  }
}