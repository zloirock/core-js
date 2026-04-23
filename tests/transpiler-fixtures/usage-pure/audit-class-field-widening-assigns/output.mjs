import _at from "@core-js/pure/actual/instance/at";
// `#v = []` init says Array, but `reset()` later assigns a string literal - the union widens
// to Array|string. commonType returns null; dispatch falls to generic `_at` so the runtime
// string branch isn't mis-served by the Array-specific variant
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