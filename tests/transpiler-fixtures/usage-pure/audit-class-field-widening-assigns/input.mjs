// `#v = []` init is Array, but `reset()` later assigns a string - the field type
// widens to Array|string, so `.at(0)` must use the generic polyfill rather than
// the array-specific one (runtime string values must still work)
class C {
  #v = [];
  reset() { this.#v = "idle"; }
  first() { return this.#v.at(0); }
}
