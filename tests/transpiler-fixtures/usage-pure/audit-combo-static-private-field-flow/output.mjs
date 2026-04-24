import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// combo: static #private field + static method write widens the field's type from Array to
// Array|string + other static method reads it through `C.#n.at(0)`. flow scan must track
// writes across static methods of the same class (not just instance) to widen correctly
class C {
  static #n = [];
  static reset() {
    C.#n = "x";
  }
  static first() {
    var _ref;
    return _atMaybeArray(_ref = C.#n).call(_ref, 0);
  }
}