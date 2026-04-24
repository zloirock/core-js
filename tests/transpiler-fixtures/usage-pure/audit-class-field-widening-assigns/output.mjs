import _at from "@core-js/pure/actual/instance/at";
// `#v = []` init is Array, but `reset()` later assigns a string - the field type
// widens to Array|string, so `.at(0)` must use the generic polyfill rather than
// the array-specific one (runtime string values must still work)
class C {
  #v = [];
  reset() {
    this.#v = "idle";
  }
  first() {
    var _ref;
    return _at(_ref = this.#v).call(_ref, 0);
  }
}