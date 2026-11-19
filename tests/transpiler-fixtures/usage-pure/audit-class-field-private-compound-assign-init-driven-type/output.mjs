import _at from "@core-js/pure/actual/instance/at";
// compound assignment (`+=`) to a private field can change the stored value's type
// independently of the init expression - `#tag = []; this.#tag += s` ends up as a string.
// `.at(0)` resolves to the generic instance helper instead of the array-specific variant
class C {
  #tag = [];
  bump(s) {
    this.#tag += s;
  }
  first() {
    var _ref;
    return _at(_ref = this.#tag).call(_ref, 0);
  }
}