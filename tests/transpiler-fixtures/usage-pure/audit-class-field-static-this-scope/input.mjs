// static methods bind `this` to the class itself, not to an instance. `this.#box = 'abc'`
// inside `static wipe()` must NOT contribute `"abc"` to the instance field's inferred
// type; `#box` stays Array, and `.at(0)` picks the array-specific polyfill
class C {
  #box = [];
  static wipe() { this.#box = "abc"; }
  first() { return this.#box.at(0); }
}
