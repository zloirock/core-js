import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// static methods bind `this` to the class itself, not an instance. `this.#box = 'abc'`
// inside `static wipe()` is an assignment to the class object, unrelated to the instance
// field's type. collectThisFieldAssignmentTypes skips static members so #box remains Array
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