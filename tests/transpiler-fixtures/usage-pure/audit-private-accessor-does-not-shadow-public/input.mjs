// private `accessor #at` and public `at` share textual names at the identifier level, but
// live in different namespaces at runtime (`#at` is only reachable through `this.#at`).
// `this.at(0)` in a method below must still resolve against the extended Array.prototype,
// not against the private accessor - otherwise the array-specific polyfill is suppressed
class Stack extends Array {
  accessor #at = 0;
  get bottom() {
    return this.at(0);
  }
  get marker() {
    return this.#at;
  }
}
