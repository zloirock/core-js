import _at from "@core-js/pure/actual/instance/at";
// a private auto-accessor narrows from its array initializer, but a sibling-instance write of a
// different type (`other.#foo = ...`) inside the class body widens the field to a union, so the
// resolver must DECLINE the array-specific `.at` and emit the generic instance helper instead.
// the write is scope-closed to the private brand, folded regardless of source position.
class C {
  accessor #foo = [10, 20];
  steal(other) {
    other.#foo = String(1);
  }
  pick() {
    var _ref;
    return _at(_ref = this.#foo).call(_ref, 0);
  }
}
export default new C().pick();